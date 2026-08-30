"""Server-side fetch/extract helper backing the card's link-preview popup.

Clicking a link inside the item detail dialog (see ticktick-list-card.js's
_openLinkPreview) hits this endpoint rather than the target URL directly, so
the card can find out - before ever trying to frame the page - whether that
framing would even work. Browsers enforce X-Frame-Options/CSP frame-ancestors
client-side with no way for the embedding page to detect after the fact that
a frame got blocked (a blocked cross-origin frame typically still fires a
`load` event, just showing nothing), so the only reliable way to know in
advance is to look at the response headers here, server-side, before telling
the frontend which experience to show:
- Framing allowed -> the frontend gets the plain live iframe, unchanged.
- Framing blocked -> the article content is extracted (readability-lxml) and
  sanitized here, and shown as a "reader mode" static view instead - avoids
  the CSP wall entirely since nothing is actually being framed at that point.
"""

from __future__ import annotations

import ipaddress
import json
import logging
import socket
from html import escape, unescape
from urllib.parse import urljoin, urlparse

import chardet
from aiohttp import ClientTimeout, web
from bs4 import BeautifulSoup, Comment
from readability import Document

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import aiohttp_client

_LOGGER = logging.getLogger(__name__)

LINK_PREVIEW_URL = "/ticktick_files/link_preview"

# Hard caps so a malicious/misbehaving URL can't tie up the event loop or
# balloon memory - this is fetching whatever URL a user (or anyone able to
# edit their TickTick tasks) supplies, not a URL this integration chose.
_FETCH_TIMEOUT = ClientTimeout(total=10)
_MAX_BODY_BYTES = 5 * 1024 * 1024  # 5 MB - plenty for an article page's HTML
_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)


def _clean_text(value) -> str:
    """Escapes a JSON-LD text field for safe HTML embedding - unescape()
    first because some sites' structured data has literal HTML entities
    baked into an otherwise-plain-text field (e.g. recipeIngredient:
    "500 g M&ouml;hren" instead of "500 g Möhren", observed on a real
    site) - escaping that as-is would round-trip through the browser back
    into the literal text "M&ouml;hren" instead of "Möhren", since &
    becomes &amp; and the rest just reads as plain characters. Normalizing
    through unescape() first means a well-formed plain-text field (the
    common case) is untouched (nothing to unescape) while a field like the
    one above still renders correctly.
    """
    return escape(unescape(str(value)))


def _detect_encoding(resp: "web.Response", body: bytes) -> str:
    """resp.charset (from the Content-Type header) when the server bothered
    to declare one - not resp.get_encoding(), which raises RuntimeError
    unless the body was already consumed via resp.read() (which the
    caller's streamed chunk-by-chunk read never does).

    Otherwise (plenty of real sites just send `Content-Type: text/html`
    with no charset param at all): try UTF-8 first, strictly, before ever
    asking chardet - UTF-8 is by far the dominant encoding on the modern
    web AND self-validating (a byte sequence that isn't actually UTF-8
    fails to decode strictly, rather than silently producing wrong
    characters the way mis-decoding UTF-8 bytes as a single-byte encoding
    does). chardet's statistical guess is only used as a fallback for a
    page that genuinely isn't UTF-8 - trusting it unconditionally instead
    produced real mojibake on a real page here (German UTF-8 text with
    ü/ö/ä - a case chardet is well known to frequently misdetect as
    Windows-1252/ISO-8859-1 instead - came back as "Gr√∂√üe" instead
    of "Größe").
    """
    if resp.charset:
        return resp.charset
    try:
        body.decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        pass
    detected = chardet.detect(body)
    return detected.get("encoding") or "utf-8"


def _is_private_or_local(host: str) -> bool:
    """True if `host` resolves to a loopback/private/link-local address.

    Blocks this endpoint from being used as an SSRF pivot into the user's
    own LAN (e.g. a task description linking to http://192.168.1.1/ or
    http://localhost:8123/...) - it fetches whatever URL it's given
    server-side, on the HA host's own network, so without this check any
    authenticated user (which normal HA users generally are, but
    requires_auth is still set below too) could use it to probe internal
    addresses otherwise unreachable from wherever their browser actually
    is. Resolves the hostname itself (not just string-matching it), so
    this isn't bypassed by a hostname that merely *looks* public but
    resolves to a private address - runs in an executor since DNS
    resolution is blocking I/O.
    """
    try:
        infos = socket.getaddrinfo(host, None)
    except OSError:
        return True  # can't resolve it -> can't safely fetch it either
    for info in infos:
        try:
            addr = ipaddress.ip_address(info[4][0])
        except ValueError:
            continue
        if (
            addr.is_private
            or addr.is_loopback
            or addr.is_link_local
            or addr.is_reserved
            or addr.is_multicast
        ):
            return True
    return False


def _frame_ancestors_blocks_us(header_value: str) -> bool:
    """True if a CSP frame-ancestors directive would block our origin.

    We can't know in advance what origin the target site would need to
    allow-list to permit framing from this specific HA instance - a bare
    '*' is the only value unambiguously safe to treat as "framing is
    allowed" here; every other value (an explicit origin list, 'self',
    'none') means our origin almost certainly isn't in it, since the site
    has no way to know our origin ahead of time. Treating anything else as
    "blocked" is the safe default - reader mode still gets the content
    across either way, just without live framing.
    """
    for directive in header_value.split(";"):
        directive = directive.strip()
        if directive.lower().startswith("frame-ancestors"):
            sources = directive.split()[1:]
            return "*" not in sources
    return False


def _sanitize_reader_html(html_fragment: str, base_url: str) -> str:
    """Strip everything but plain readable markup before this is ever
    injected into the card's own shadow DOM via innerHTML.

    This HTML originated from an arbitrary third-party page (whatever URL
    was in a task description) - readability-lxml's own summary() already
    drops most of the surrounding page chrome, but does not sanitize for
    safe HTML injection, so a leftover <script>, an onload= handler, or a
    javascript: link from the source page would otherwise execute in the
    context of the user's own Home Assistant frontend. This function is
    the actual security boundary, not readability-lxml's extraction.
    """
    soup = BeautifulSoup(html_fragment, "html.parser")

    for tag in soup(
        [
            "script",
            "style",
            "iframe",
            "object",
            "embed",
            "form",
            "input",
            "button",
            "svg",
            "link",
            "meta",
            "noscript",
        ]
    ):
        tag.decompose()
    for comment in soup.find_all(string=lambda s: isinstance(s, Comment)):
        comment.extract()

    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.lower().startswith("on"):
                del tag.attrs[attr]
        tag.attrs.pop("style", None)
        tag.attrs.pop("class", None)
        tag.attrs.pop("id", None)

    for img in soup.find_all("img"):
        src = img.get("src")
        for attr in list(img.attrs):
            if attr not in ("src", "alt"):
                del img.attrs[attr]
        resolved = urljoin(base_url, src) if src else None
        if resolved and resolved.startswith(("http://", "https://")):
            img["src"] = resolved
        else:
            img.decompose()

    for a in soup.find_all("a"):
        href = a.get("href")
        for attr in list(a.attrs):
            if attr != "href":
                del a.attrs[attr]
        resolved = urljoin(base_url, href) if href else None
        if resolved and resolved.startswith(("http://", "https://")):
            a["href"] = resolved
            a["target"] = "_blank"
            a["rel"] = "noopener noreferrer"
        else:
            a.attrs.pop("href", None)

    return str(soup)


_JSONLD_RECIPE_LABELS = {
    "de": {"ingredients": "Zutaten", "instructions": "Zubereitung"},
    "en": {"ingredients": "Ingredients", "instructions": "Instructions"},
}


def _flatten_jsonld(data):
    """Yields every dict in a JSON-LD payload, however it's nested - sites
    use a bare object, a top-level list, or an @graph wrapper, sometimes
    all on the same page for different entities."""
    if isinstance(data, list):
        for item in data:
            yield from _flatten_jsonld(item)
    elif isinstance(data, dict):
        if "@graph" in data:
            yield from _flatten_jsonld(data["@graph"])
        else:
            yield data


def _parse_jsonld(html: str) -> tuple[dict | None, dict]:
    """Looks for schema.org Recipe structured data (JSON-LD) - the same
    machine-readable ingredients/instructions most recipe sites already
    publish for Google's rich-snippet recipe cards, checked before falling
    back to a generic DOM-based extraction below. A "pick the single best
    content block" scorer (readability's approach) has no way to know a
    separate ingredients panel - a common recipe-page layout, ingredients
    and instructions in two sibling sections rather than one shared
    container - belongs in the result too; structured data sidesteps that
    entirely by not needing to guess at DOM structure at all.

    Also builds an @id -> entity index across every JSON-LD block on the
    page (one pass, alongside the Recipe search above) - some sites (e.g.
    chefkoch) point a field like `image` at a *separate* entity elsewhere
    in the same graph via a bare `{"@id": "...#primaryimage"}` reference
    instead of inlining the ImageObject directly, so resolving that
    reference needs every entity on the page, not just the Recipe one.
    Returns (recipe_or_None, id_index) - the index is returned even when
    no Recipe is found, though nothing currently uses it in that case.
    """
    soup = BeautifulSoup(html, "html.parser")
    id_index: dict = {}
    recipe = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except (ValueError, TypeError):
            continue
        for entity in _flatten_jsonld(data):
            entity_id = entity.get("@id")
            if entity_id:
                id_index[entity_id] = entity
            if recipe is None:
                types = entity.get("@type")
                types = types if isinstance(types, list) else [types]
                if "Recipe" in types and entity.get("recipeIngredient"):
                    recipe = entity
    return recipe, id_index


def _resolve_jsonld_ref(value, id_index: dict):
    """If value is a bare {"@id": "..."} reference (nothing else on it),
    returns the entity it points to from id_index - falling back to the
    reference dict itself if the target isn't indexed, which simply won't
    have a usable url either, same as if this weren't a reference at all.
    Otherwise returns value unchanged (already the real inline value)."""
    if isinstance(value, dict) and set(value.keys()) == {"@id"}:
        return id_index.get(value["@id"], value)
    return value


def _recipe_image_url(image, base_url: str, id_index: dict) -> str | None:
    if isinstance(image, list):
        image = image[0] if image else None
    image = _resolve_jsonld_ref(image, id_index)
    if isinstance(image, dict):
        image = image.get("url") or image.get("contentUrl")
    if isinstance(image, str) and image:
        resolved = urljoin(base_url, image)
        if resolved.startswith(("http://", "https://")):
            return resolved
    return None


def _recipe_instructions_html(instructions, labels: dict) -> str:
    """Flattens schema.org recipeInstructions - a plain string, a list of
    HowToStep, or a list of HowToSection each with their own nested
    itemListElement of HowToStep - into one ordered list (with a
    sub-heading per section, for recipes that group steps that way)."""
    parts = []
    list_open = False

    def close_list():
        nonlocal list_open
        if list_open:
            parts.append("</ol>")
            list_open = False

    def walk(node):
        nonlocal list_open
        if isinstance(node, str):
            if not list_open:
                parts.append("<ol>")
                list_open = True
            parts.append(f"<li>{_clean_text(node)}</li>")
        elif isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            if node.get("@type") == "HowToSection":
                close_list()
                if node.get("name"):
                    parts.append(f"<h3>{_clean_text(node['name'])}</h3>")
                walk(node.get("itemListElement"))
            else:
                text = node.get("text") or node.get("name")
                if text:
                    walk(text)

    # Only prepend our own generic "Zubereitung"/"Instructions" heading
    # when the data doesn't already start with a named section - a single
    # HowToSection's own name is almost always that exact same generic
    # word already (chefkoch, among others, does this - producing a
    # visibly duplicated heading otherwise), and a multi-section recipe's
    # sections have their own more specific names (e.g. "Für den Teig"/
    # "Für die Füllung") which read fine without a redundant heading above
    # them either.
    top_level = instructions if isinstance(instructions, list) else [instructions]
    starts_with_named_section = bool(top_level) and (
        isinstance(top_level[0], dict) and top_level[0].get("@type") == "HowToSection" and top_level[0].get("name")
    )

    walk(instructions)
    close_list()
    if not parts:
        return ""
    if starts_with_named_section:
        return "".join(parts)
    return f"<h3>{escape(labels['instructions'])}</h3>" + "".join(parts)


def _render_recipe_html(recipe: dict, base_url: str, ui_lang: str, id_index: dict) -> str:
    """Builds a clean reader view directly from schema.org Recipe JSON-LD -
    already plain text fields (not HTML), so escape() is the correct and
    sufficient sanitization here, unlike _sanitize_reader_html's heavier
    HTML-stripping (there's no markup in these fields to strip).

    The "Zutaten"/"Ingredients" etc. labels are this card's own UI chrome,
    not part of the recipe's actual content - so they follow the same
    language the rest of the card's UI is already in (ui_lang, passed
    through from the frontend's own hass.locale.language, see
    ticktick-list-card.js's _openLinkPreview) rather than the recipe
    page's own inLanguage metadata, which frequently doesn't match (many
    German recipe sites still declare inLanguage: en, or omit it and fall
    back to whatever a generic default happens to be).
    """
    labels = _JSONLD_RECIPE_LABELS["de"] if ui_lang.lower().startswith("de") else _JSONLD_RECIPE_LABELS["en"]

    parts = []
    image_url = _recipe_image_url(recipe.get("image"), base_url, id_index)
    if image_url:
        parts.append(f'<img src="{escape(image_url, quote=True)}" alt="">')

    description = recipe.get("description")
    if isinstance(description, str) and description.strip():
        parts.append(f"<p>{_clean_text(description)}</p>")

    ingredients = [i for i in recipe.get("recipeIngredient") or [] if isinstance(i, str) and i.strip()]
    if ingredients:
        parts.append(f"<h3>{escape(labels['ingredients'])}</h3><ul>")
        parts.extend(f"<li>{_clean_text(i)}</li>" for i in ingredients)
        parts.append("</ul>")

    instructions_html = _recipe_instructions_html(recipe.get("recipeInstructions"), labels)
    if instructions_html:
        parts.append(instructions_html)

    return "".join(parts)


# A real article/recipe body - even a short one - reliably clears this;
# readability landing under it on a real content page (as opposed to
# correctly recognizing a genuinely link-only page) means it most likely
# picked the wrong section of the page rather than the page having little
# content, so _generic_body_extract's much less selective pass is worth
# preferring over risking readability's narrow miss. Explicit product
# direction: showing extra surrounding content (nav remnants, related
# links) this occasionally lets through is a far less bad failure than
# showing almost nothing, which is what prompted this fallback at all.
_MIN_READABILITY_TEXT_CHARS = 800

_GENERIC_CHROME_TAGS = [
    "script",
    "style",
    "nav",
    "header",
    "footer",
    "form",
    "noscript",
    "svg",
    "iframe",
    "object",
    "embed",
]

# Whole-text-node match only (a text node reading exactly "mehr", nothing
# else) - deliberately not a substring check, so a normal sentence that
# happens to contain the word "mehr"/"more" (e.g. an instruction step like
# "noch mehr Wasser hinzufügen") is never touched, only an isolated link
# label is (the actual real-world markup this targets: a short "mehr"/
# "more"-only link/span at the end of a teaser blurb).
_MORE_LINK_TEXTS = {
    "mehr",
    "weiterlesen",
    "weiter lesen",
    "read more",
    "more",
    "continue reading",
}


def _strip_teaser_cards(soup: BeautifulSoup) -> None:
    """Removes "related content" teaser cards - a heading plus a short
    blurb ending in an isolated "mehr"/"read more" link, repeated as
    recommendations - from a broad extraction (_generic_body_extract)
    that otherwise has no way to distinguish that pattern from genuine
    content, since it isn't chrome in the way a <nav> unambiguously is.

    For each "mehr"-only text node found, walks up from it to the
    smallest ancestor that itself contains a heading (h1-h6) - that's the
    natural boundary of one card (title + blurb + link) - and removes
    that whole ancestor, not just the link. Mutates soup in place.
    """
    for marker in list(soup.find_all(string=lambda s: isinstance(s, str) and s.strip().lower() in _MORE_LINK_TEXTS)):
        node = marker.parent
        while node is not None and node.name not in ("body", "[document]"):
            if node.find(["h1", "h2", "h3", "h4", "h5", "h6"]):
                node.decompose()
                break
            node = node.parent


def _strip_link_only_blocks(root) -> None:
    """Removes containers that are purely navigational - a breadcrumb, a
    product cross-link, a "print this page"/share-buttons list, a "you
    might also like" card grid - which a broad body-minus-chrome pass
    otherwise has no way to distinguish from real content, since none of
    it is chrome in the way a <nav>/<footer> tag unambiguously is.

    A container is left alone the moment it wraps a <p> or <table>
    ANYWHERE inside it (however deeply nested) - safe by construction:
    the actual recipe/article content (ingredient tables, instruction
    paragraphs) always contains one of those, so this only ever reaches
    the smaller wrapper divs/lists *around* that content once the real
    content itself is excluded from consideration. Mutates root in place.
    """
    for tag in root.find_all(["div", "ul", "ol", "section"]):
        if tag.find("a") and not tag.find(["p", "table"]):
            tag.decompose()


def _unwrap_image_only_list_items(root) -> None:
    """Unwraps <li> elements whose only real content is a single image
    (directly, or via a <figure>, caption and all) - a single-item
    "gallery slider" <ul><li><figure><img>...</figure></li></ul> wrapper
    around a lead image is a common pattern that would otherwise show a
    stray bullet point next to the picture, since a broad extraction has
    no reason to treat a one-item list any differently from a real
    bulleted list of actual list content. If unwrapping leaves the
    enclosing list with no <li> children at all, that now-pointless empty
    wrapper is unwrapped too, leaving just the image/figure directly in
    the flow. Mutates root in place.
    """
    for li in root.find_all("li"):
        children = [c for c in li.children if not (isinstance(c, str) and not c.strip())]
        if len(children) == 1 and children[0].name in ("img", "figure"):
            parent = li.parent
            li.unwrap()
            if parent is not None and parent.name in ("ul", "ol") and not parent.find("li", recursive=False):
                parent.unwrap()


def _keep_only_first_image(root) -> None:
    """Drops every <img> after the first - per explicit request, a small
    reader-mode popup should show one lead/hero image, not every inline
    product shot, related-card thumbnail, or logo a broad body-minus-
    chrome pass would otherwise keep (none of those are chrome either, so
    nothing above already excludes them)."""
    images = root.find_all("img")
    for img in images[1:]:
        img.decompose()


def _text_length(html_fragment: str) -> int:
    return len(BeautifulSoup(html_fragment, "html.parser").get_text(strip=True))


def _generic_body_extract(html: str) -> str:
    """Deliberately broad: strips only unambiguous chrome from the whole
    extraction root and keeps everything else, rather than trying to
    guess at a single "main content" region the way readability does -
    see _MIN_READABILITY_TEXT_CHARS above for when this gets used
    instead. The other helpers above then narrow that down further:
    - Root is <main> when the page has one, not the whole <body> - a
      site's own contact/imprint footer is a common example of content
      that reads as perfectly legitimate prose (real <p> tags, not
      navigational) and so survives every rule below, but sits outside
      <main> on any page using that tag semantically correctly (which is
      exactly why it's worth preferring over <body> here, not just an
      arbitrary root choice).
    - _strip_teaser_cards removes "read more"-terminated recommendation
      blurbs.
    - _strip_link_only_blocks removes breadcrumbs/share-lists/card grids
      - navigational content _strip_teaser_cards' narrower pattern
        doesn't catch (no "mehr"-style marker, e.g. an image-only card
        grid with no visible link text at all).
    - _unwrap_image_only_list_items drops the stray bullet a single-item
      image "gallery" wrapper would otherwise put next to the lead image.
    - _keep_only_first_image drops every image but the lead one.
    """
    soup = BeautifulSoup(html, "html.parser")
    root = soup.main or soup.body or soup
    for tag in root(_GENERIC_CHROME_TAGS):
        tag.decompose()
    _strip_teaser_cards(root)
    _strip_link_only_blocks(root)
    _unwrap_image_only_list_items(root)
    _keep_only_first_image(root)
    return str(root)


def _extract_reader_content(html: str, base_url: str, ui_lang: str) -> tuple[str, str]:
    """Runs in an executor - JSON-LD/readability/lxml parsing is all
    blocking CPU work. Tries, in order: structured Recipe data (most
    reliable when present), readability's own extraction, and finally the
    much less selective whole-body fallback above. ui_lang only matters
    for the Recipe path (see _render_recipe_html) - the other two just
    pass through whatever language the source page itself was in."""
    recipe, id_index = _parse_jsonld(html)
    if recipe:
        # Plain text, not HTML - the frontend does its own escapeHtml() on
        # this (see the JS `preview.title` usage), so only unescape() any
        # entities baked into the source field (see _clean_text), never
        # escape() here too or those show up literally (e.g. "M&ouml;hren"
        # instead of "Möhren" - the exact bug _clean_text exists to avoid
        # everywhere else this data flows).
        title = unescape(str(recipe.get("name") or "Recipe"))
        return title, _render_recipe_html(recipe, base_url, ui_lang, id_index)

    doc = Document(html)
    title = doc.short_title()
    summary = doc.summary()
    if _text_length(summary) < _MIN_READABILITY_TEXT_CHARS:
        summary = _generic_body_extract(html)
    return title, _sanitize_reader_html(summary, base_url)


class TickTickLinkPreviewView(HomeAssistantView):
    """Fetch a URL server-side and report how the card should show it."""

    url = LINK_PREVIEW_URL
    name = "ticktick:link_preview"
    # Fetches arbitrary URLs server-side on the HA host's behalf - see
    # _is_private_or_local for the accompanying SSRF guard.
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the view."""
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        """Handle a link-preview lookup for ?url=(&lang=)."""
        target = request.query.get("url")
        if not target:
            return web.json_response({"mode": "error", "message": "Missing url"}, status=400)
        # The frontend's own hass.locale.language (see _openLinkPreview) -
        # used only for this card's own UI labels in the Recipe reader
        # view, not the fetch/extraction itself. Defaults to English on a
        # missing/empty value, same default the card's own _t() uses.
        ui_lang = request.query.get("lang") or "en"

        parsed = urlparse(target)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            return web.json_response({"mode": "error", "message": "Invalid URL"}, status=400)

        if await self._hass.async_add_executor_job(_is_private_or_local, parsed.hostname):
            return web.json_response({"mode": "error", "message": "URL not allowed"}, status=400)

        session = aiohttp_client.async_get_clientsession(self._hass)
        try:
            async with session.get(
                target,
                timeout=_FETCH_TIMEOUT,
                headers={
                    "User-Agent": _USER_AGENT,
                    "Accept": "text/html,application/xhtml+xml",
                },
                # Redirects aren't followed automatically - each hop would
                # need the same private/local-address check the initial URL
                # just got, which round-tripping through allow_redirects
                # can't do. An unresolved redirect just surfaces as an
                # "error" mode below; the card's own "open in new tab"
                # fallback still follows it fine as a normal browser
                # navigation.
                allow_redirects=False,
            ) as resp:
                if resp.status >= 300:
                    return web.json_response(
                        {"mode": "error", "message": f"HTTP {resp.status}"}
                    )

                if "html" not in (resp.content_type or ""):
                    return web.json_response({"mode": "error", "message": "Not an HTML page"})

                blocks_framing = bool(resp.headers.get("X-Frame-Options")) or _frame_ancestors_blocks_us(
                    resp.headers.get("Content-Security-Policy", "")
                )
                if not blocks_framing:
                    # Nothing to extract - the card can just frame the live
                    # page directly, so the body is never even read here.
                    return web.json_response({"mode": "iframe"})

                # resp.content.read(n) is NOT "read until n bytes or EOF" -
                # for a chunked/streamed response (which most real sites
                # use) it can return as soon as whatever's currently
                # buffered is shorter than n, well before the real body
                # ends (observed truncating a 330KB page to ~16KB). Reading
                # in bounded chunks until EOF is what actually drains the
                # whole response while still aborting early past the cap.
                chunks = []
                total = 0
                async for chunk in resp.content.iter_chunked(65536):
                    total += len(chunk)
                    if total > _MAX_BODY_BYTES:
                        return web.json_response({"mode": "error", "message": "Page too large"})
                    chunks.append(chunk)
                # Not resp.get_encoding(): that raises RuntimeError unless
                # the body was already read through resp.read() (which
                # populates state this streamed chunk-by-chunk read above
                # never touches) - observed failing outright on any page
                # whose Content-Type omits a charset (plenty do), rather
                # than falling back to the sniffing it also does.
                body_bytes = b"".join(chunks)
                html = body_bytes.decode(_detect_encoding(resp, body_bytes), errors="replace")
        except Exception as err:  # noqa: BLE001 - any fetch failure just falls back to "open in new tab" in the UI
            _LOGGER.debug("Link preview fetch failed for %s: %s", target, err)
            return web.json_response({"mode": "error", "message": "Could not load preview"})

        try:
            title, reader_html = await self._hass.async_add_executor_job(
                _extract_reader_content, html, target, ui_lang
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Link preview extraction failed for %s: %s", target, err)
            return web.json_response({"mode": "error", "message": "Could not extract content"})

        return web.json_response({"mode": "reader", "title": title, "html": reader_html})
