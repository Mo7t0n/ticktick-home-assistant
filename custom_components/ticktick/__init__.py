"""The TickTick Integration integration."""

from __future__ import annotations

import datetime
import logging
from pathlib import Path

from aiohttp import web

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import (
    HomeAssistantView,
    StaticPathConfig,
    async_import_module,
)
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.helpers import aiohttp_client

from . import api
from .const import CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES, DOMAIN
from .coordinator import TickTickCoordinator
from .link_preview import TickTickLinkPreviewView
from .service_handlers import (
    handle_complete_subtask,
    handle_complete_task,
    handle_create_task,
    handle_delete_task,
    handle_get_projects,
    handle_get_task,
    handle_update_task,
)
from .ticktick_api_python.ticktick_api import TickTickAPIClient

type TickTickConfigEntry = ConfigEntry[api.AsyncConfigEntryAuth]

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.TODO, Platform.SENSOR]

CARD_URL_PATH = "/ticktick_files"
CARD_JS_URL = f"{CARD_URL_PATH}/ticktick-list-card.js"


async def async_setup_entry(hass: HomeAssistant, entry: TickTickConfigEntry) -> bool:
    """Set up TickTick Integration from a config entry."""

    config_entry_oauth2_flow = await async_import_module(
        hass, "homeassistant.helpers.config_entry_oauth2_flow"
    )

    implementation = (
        await config_entry_oauth2_flow.async_get_config_entry_implementation(
            hass, entry
        )
    )

    session = config_entry_oauth2_flow.OAuth2Session(hass, entry, implementation)

    # Using an aiohttp-based API lib
    aiohttp_session = aiohttp_client.async_get_clientsession(hass)
    entry.runtime_data = api.AsyncConfigEntryAuth(aiohttp_session, session)
    access_token = await entry.runtime_data.async_get_access_token()

    tickTickApiClient = TickTickAPIClient(access_token, aiohttp_session)

    await register_coordiantor(hass, tickTickApiClient, entry, access_token)
    _LOGGER.debug("TickTick: coordinator registered")
    await register_services(hass, tickTickApiClient)
    _LOGGER.debug("TickTick: services registered")
    await register_frontend_card(hass)
    _LOGGER.debug("TickTick: frontend card registered")

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    _LOGGER.debug("TickTick: platforms forwarded: %s", PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: TickTickConfigEntry) -> bool:
    """Unload a TickTick config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


class TickTickCardView(HomeAssistantView):
    """Serve the bundled dashboard card JS with an explicit content-type.

    hass.http.async_register_static_paths (used below for the rest of the
    www/ folder) leaves content-type detection to aiohttp, which falls
    back to the *host's* mimetypes database for the file extension. On
    some setups that database doesn't map .js to anything, so the
    response comes back with NO Content-Type header at all - and browsers
    refuse to execute that as a module under X-Content-Type-Options:
    nosniff (which Home Assistant's own middleware always adds), so the
    custom element never gets defined even though the file itself loads
    fine. Serving this one file through a dedicated view with an explicit
    content_type sidesteps that regardless of the host's mimetypes config.

    Built on aiohttp's own FileResponse (not a plain in-memory web.Response)
    so it gets working ETag/Last-Modified conditional-GET support for free,
    same as every other HA frontend resource - explicitly passing our own
    Content-Type header here still overrides FileResponse's built-in type
    guessing, so that part of the fix above is untouched. Without this, the
    browser had to re-fetch and re-parse the whole file on every single
    page load with no caching at all; on a hard reload that made this
    file's load slow enough to occasionally lose the race against HA
    frontend's hardcoded 2-second customElements.whenDefined() timeout
    (verified in the frontend bundle), surfacing as an intermittent
    "Custom element doesn't exist" error that a second reload "fixed" only
    by chance.

    Cache-Control here is a long-lived "public, immutable" cache rather than
    a conditional "no-cache" revalidate-every-time policy, specifically so a
    warm load can skip the network round trip for this file *entirely*
    (straight from the browser's on-disk cache, zero latency) instead of
    still paying for a conditional GET/304 on every single page load. That
    round trip is exactly where the whenDefined() race above still gets
    lost intermittently - most visibly on Firefox, whose module-script
    conditional-GET path measurably loses time to Chromium's here even on a
    fast connection, occasionally enough to blow the 2-second budget on its
    own. This is only safe to do because the URL below is already
    content-addressed (register_frontend_card appends the file's own mtime
    as a `?v=` query string) - a real content change always mints a
    brand-new URL that this long max-age has never seen before, so nothing
    here trades away picking up updates. This response itself never sees
    that query string (aiohttp routes match on path only), so it doesn't
    know or care whether the current request's URL is the "new" one; it
    just always answers cacheably, which is correct either way.
    """

    url = CARD_JS_URL
    name = "ticktick:card_js"
    requires_auth = False

    def __init__(self, js_path: Path) -> None:
        """Initialize the view."""
        self._js_path = js_path

    async def get(self, request: web.Request) -> web.FileResponse:
        """Serve the card's JavaScript."""
        return web.FileResponse(
            self._js_path,
            headers={
                "Content-Type": "text/javascript",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        )


async def register_frontend_card(hass: HomeAssistant) -> None:
    """Register the bundled TickTick Lovelace card as a frontend resource."""
    if hass.data.get(DOMAIN, {}).get("frontend_registered"):
        return

    www_path = Path(__file__).parent / "www"
    card_js_path = www_path / "ticktick-list-card.js"

    # Registered before the static path below, so this exact route wins
    # over the static resource's own (prefix-based) match for the same
    # URL - the static resource still covers everything else in www/
    # (e.g. the README screenshot), just not this one file anymore.
    hass.http.register_view(TickTickCardView(card_js_path))
    # Backs the card's link-preview popup (see link_preview.py's own
    # docstring) - registered here alongside the card's own view since both
    # are frontend-support endpoints under the same /ticktick_files prefix.
    hass.http.register_view(TickTickLinkPreviewView(hass))

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL_PATH, str(www_path), cache_headers=False)]
    )

    # TickTickCardView now serves this file as long-lived immutable (see its
    # docstring), which only stays correct because the URL itself changes
    # whenever the file's contents change - appending the file's own mtime
    # as a query string here is what guarantees that. Every caching layer
    # (browser disk cache, HA's own PWA service worker if it intercepts this
    # fetch before it ever reaches the network, an intermediate proxy, ...)
    # treats a new query string as a completely unrelated, never-before-seen
    # resource, so a real content change is still always a guaranteed cache
    # miss picking up the new file - independent of whatever caching
    # behavior is actually in play, and regardless of how strictly any of
    # those layers honor conditional-GET semantics. aiohttp routes match on
    # path only, so this doesn't need any matching change on the
    # TickTickCardView registration above. Computed once here (at
    # integration setup) rather than per-request like the view's own
    # ETag, since this URL is baked into either the Lovelace resources
    # collection or index.html (see below) for the whole hass lifetime -
    # picking up a change requires a full HA restart either way (this
    # function's own frontend_registered guard above already only runs
    # once per restart), same as any other custom_component code change
    # already does.
    mtime_ns = await hass.async_add_executor_job(lambda: card_js_path.stat().st_mtime_ns)
    versioned_url = f"{CARD_JS_URL}?v={mtime_ns}"

    if not await _async_register_lovelace_resource(hass, versioned_url):
        # Fallback for the rare case Lovelace resources aren't writable
        # here (see that function's docstring) - still gets the script
        # loaded, just back on this racier path. See TickTickCardView's own
        # docstring for the 2-second customElements.whenDefined() race this
        # is prone to lose, especially on an instance with many other
        # extra_js_url-registered scripts competing for the same
        # document-order module execution queue.
        add_extra_js_url(hass, versioned_url)


async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> bool:
    """Register (or update) `url` as a Lovelace module resource.

    Returns True if this HA instance actually supports that (and the
    registration - create or update - is done), False if it doesn't and
    the add_extra_js_url fallback above should be used instead.

    This is what puts this card on the same footing as every other custom
    card installed the normal way (e.g. via HACS): Lovelace loads its own
    registered resources - and *awaits* that - before it ever tries to
    build a dashboard, so by the time it attempts to instantiate
    <ticktick-list-card>, the element is already guaranteed to be defined.
    That sidesteps the whole customElements.whenDefined() race that
    add_extra_js_url is prone to lose (see TickTickCardView's docstring) -
    it doesn't just make that race faster to win, there's no race at all
    this way. Verified against the actual homeassistant.components.lovelace
    source (const.py, resources.py) rather than assumed, since this reaches
    into a part of core HA this integration doesn't otherwise depend on.
    """
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        # Lovelace itself isn't set up in this hass instance at all (very
        # unusual - it's part of default_config) - nothing to register
        # against.
        return False

    resources = lovelace_data.resources
    if not isinstance(resources, ResourceStorageCollection):
        # The other possible type is ResourceYAMLCollection: resources are
        # pinned to `lovelace: resources:` in configuration.yaml on this
        # instance, which is read-only from here - the user would have to
        # add this URL there themselves.
        return False

    # ResourceStorageCollection lazy-loads its data from storage on first
    # use; the actual trigger for that (_async_ensure_loaded) is private
    # API, but async_get_info() is public and does it as a side effect,
    # which is enough to make the async_items() read below reflect what's
    # actually in storage rather than an empty not-yet-loaded collection.
    await resources.async_get_info()

    existing = next(
        (
            item
            for item in resources.async_items()
            if item["url"].split("?")[0] == CARD_JS_URL
        ),
        None,
    )
    if existing is None:
        await resources.async_create_item({"res_type": "module", "url": url})
    elif existing["url"] != url:
        await resources.async_update_item(
            existing["id"], {"res_type": "module", "url": url}
        )
    return True

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["frontend_registered"] = True


async def register_coordiantor(
    hass: HomeAssistant,
    tickTickApiClient: TickTickAPIClient,
    entry: TickTickConfigEntry,
    access_token: str,
) -> None:
    """Register Coordinator for TickTick Todo Entity."""
    scan_interval_minutes = entry.options.get(
        CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES
    )
    scan_interval = datetime.timedelta(minutes=scan_interval_minutes)
    coordinator = TickTickCoordinator(
        hass, _LOGGER, entry, scan_interval, tickTickApiClient, access_token
    )
    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator


async def register_services(
    hass: HomeAssistant, tickTickApiClient: TickTickAPIClient
) -> None:
    """Register TickTick services."""

    hass.services.async_register(
        DOMAIN,
        "get_task",
        await handle_get_task(tickTickApiClient),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        "create_task",
        await handle_create_task(tickTickApiClient),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        "complete_task",
        await handle_complete_task(tickTickApiClient),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "delete_task",
        await handle_delete_task(tickTickApiClient),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "complete_subtask",
        await handle_complete_subtask(tickTickApiClient),
        supports_response=SupportsResponse.OPTIONAL,
    )

    hass.services.async_register(
        DOMAIN,
        "update_task",
        await handle_update_task(tickTickApiClient),
        supports_response=SupportsResponse.OPTIONAL,
    )

    hass.services.async_register(
        DOMAIN,
        "get_projects",
        await handle_get_projects(tickTickApiClient),
        supports_response=SupportsResponse.ONLY,
    )
    # hass.services.async_register(DOMAIN, 'get_project', await handle_my_service)
    # hass.services.async_register(DOMAIN, 'get_detailed_project', handle_my_service(tickTickApiClient))
    # hass.services.async_register(DOMAIN, 'delete_project', handle_my_service(tickTickApiClient))
    # hass.services.async_register(DOMAIN, 'create_project', handle_my_service(tickTickApiClient))
