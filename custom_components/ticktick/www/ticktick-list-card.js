/**
 * TickTick List Card
 *
 * A Lovelace card that renders a `sensor.ticktick_*` entity (created by the
 * TickTick Home Assistant integration) the way the TickTick app renders a
 * list: a priority-colored checkbox ring + due-date bucket grouping for
 * TASK-kind lists, and a note/tag-chip layout for NOTE-kind lists. Includes
 * a two-level (primary + secondary) sort control and a filter panel.
 */

const SORT_KEYS = ["dueDate", "priority", "startDate", "title", "tag"];

// All the card's own UI text (not the item data itself, which comes from
// TickTick as-is) lives here in German/English pairs. resolveLanguage/t()
// below pick between them based on hass.locale.language, falling back to
// English for anything that isn't German - date/weekday formatting and
// string sorting are handled separately via Intl (see formatParsedDate/
// compareBy), which already localizes to whatever exact locale HA reports.
const STRINGS = {
  de: {
    sortDueDate: "Fälligkeitsdatum",
    sortPriority: "Priorität",
    sortStartDate: "Startdatum",
    sortTitle: "Alphabetisch",
    sortTag: "Etikett",
    directionAsc: "Aufsteigend",
    directionDesc: "Absteigend",
    menuGroup: "Gruppieren nach",
    menuSort: "Sortieren nach",
    menuOrder: "Reihenfolge",
    menuFilter: "Filtern",
    filterDue: "Fälligkeit",
    filterActiveCount: (n) => `${n} aktiv`,
    filterAll: "Alle",
    priorityNone: "Ohne Priorität",
    priorityLow: "Niedrig",
    priorityMedium: "Mittel",
    priorityHigh: "Hoch",
    bucketOverdue: "Überfällig",
    bucketToday: "Heute",
    bucketTomorrow: "Morgen",
    bucketNext7: "Nächste 7 Tage",
    bucketLater: "Später",
    bucketNoDate: "Kein Datum",
    noTag: "Ohne Etikett",
    completedGroup: "Erledigt",
    reopen: "Wieder öffnen",
    markComplete: "Als erledigt markieren",
    note: "Notiz",
    sortAndFilter: "Sortieren & Filtern",
    selectEntity: "Bitte eine TickTick-Listen-Entität auswählen.",
    entityNotFound: (id) => `Entität ${id} wurde nicht gefunden.`,
    noEntries: "Keine Einträge.",
    close: "Schließen",
    detailContent: "Inhalt",
    detailDue: "Fällig",
    detailStart: "Start",
    detailStatus: "Status",
    statusCompleted: "Erledigt",
    statusOpen: "Offen",
    detailTags: "Etiketten",
    detailChecklist: "Checkliste",
    editorEntity: "Entität",
    editorTitle: "Titel (optional)",
    cardDescription: "Zeigt eine TickTick-Liste (Aufgaben oder Notizen) im Stil der TickTick-App an.",
  },
  en: {
    sortDueDate: "Due date",
    sortPriority: "Priority",
    sortStartDate: "Start date",
    sortTitle: "Alphabetical",
    sortTag: "Tag",
    directionAsc: "Ascending",
    directionDesc: "Descending",
    menuGroup: "Group by",
    menuSort: "Sort by",
    menuOrder: "Order",
    menuFilter: "Filter",
    filterDue: "Due date",
    filterActiveCount: (n) => `${n} active`,
    filterAll: "All",
    priorityNone: "No priority",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    bucketOverdue: "Overdue",
    bucketToday: "Today",
    bucketTomorrow: "Tomorrow",
    bucketNext7: "Next 7 days",
    bucketLater: "Later",
    bucketNoDate: "No date",
    noTag: "No tag",
    completedGroup: "Completed",
    reopen: "Reopen",
    markComplete: "Mark as done",
    note: "Note",
    sortAndFilter: "Sort & filter",
    selectEntity: "Please select a TickTick list entity.",
    entityNotFound: (id) => `Entity ${id} was not found.`,
    noEntries: "No entries.",
    close: "Close",
    detailContent: "Content",
    detailDue: "Due",
    detailStart: "Start",
    detailStatus: "Status",
    statusCompleted: "Completed",
    statusOpen: "Open",
    detailTags: "Tags",
    detailChecklist: "Checklist",
    editorEntity: "Entity",
    editorTitle: "Title (optional)",
    cardDescription: "Shows a TickTick list (tasks or notes) styled like the TickTick app.",
  },
};

function resolveLanguage(language) {
  return typeof language === "string" && language.toLowerCase().startsWith("de") ? "de" : "en";
}

function t(key, language, ...args) {
  const value = STRINGS[resolveLanguage(language)][key] ?? STRINGS.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

const SORT_LABEL_KEYS = {
  dueDate: "sortDueDate",
  priority: "sortPriority",
  startDate: "sortStartDate",
  title: "sortTitle",
  tag: "sortTag",
};

const DIRECTION_LABEL_KEYS = { asc: "directionAsc", desc: "directionDesc" };
const DIRECTION_ICONS = { asc: "mdi:sort-ascending", desc: "mdi:sort-descending" };

const SORT_KEY_ICONS = {
  dueDate: "mdi:calendar-clock",
  priority: "mdi:flag-outline",
  startDate: "mdi:calendar-start",
  title: "mdi:sort-alphabetical-variant",
  tag: "mdi:tag-outline",
};

// Mirrors the TickTick app's own menu: "Group by" drives both the visible
// sections (see _groupedItems) and the primary sort key, "Sort by" orders
// items within a group, "Order" is the shared direction toggle. "Filter" is
// folded into the same popup as a 4th entry instead of its own button/panel.
const MENU_FIELDS = [
  { field: "group", labelKey: "menuGroup", icon: "mdi:layers-outline" },
  { field: "sort", labelKey: "menuSort", icon: "mdi:sort" },
  { field: "order", labelKey: "menuOrder", icon: "mdi:swap-vertical" },
  { field: "filter", labelKey: "menuFilter", icon: "mdi:filter-variant" },
];

const FILTER_GROUP_ICONS = {
  priority: "mdi:flag-outline",
  tag: "mdi:tag-outline",
  due: "mdi:calendar-clock",
};

const PRIORITY_LABEL_KEYS = {
  NONE: "priorityNone",
  LOW: "priorityLow",
  MEDIUM: "priorityMedium",
  HIGH: "priorityHigh",
};

const BUCKET_ORDER = ["overdue", "today", "tomorrow", "next7", "later", "noDate"];

const BUCKET_LABEL_KEYS = {
  overdue: "bucketOverdue",
  today: "bucketToday",
  tomorrow: "bucketTomorrow",
  next7: "bucketNext7",
  later: "bucketLater",
  noDate: "bucketNoDate",
};

const NO_TAG_KEY = "__no_tag__";
const COMPLETED_GROUP_KEY = "__completed__";

// Persists the live sort/group/order/filter state per entity across page
// reloads (setConfig only ever carries the YAML defaults, never what the
// user picked in the popup menu - that state used to live purely in memory
// and vanish on every reload). Keyed by entity id rather than the card
// instance so the choice survives the card being torn down and recreated
// (e.g. a dashboard reload), which is exactly the case that needs fixing.
const STATE_STORAGE_PREFIX = "ticktick-list-card-state:";

function loadStoredState(entityId) {
  if (!entityId) return null;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_PREFIX + entityId);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function saveStoredState(entityId, state) {
  if (!entityId) return;
  try {
    localStorage.setItem(STATE_STORAGE_PREFIX + entityId, JSON.stringify(state));
  } catch (err) {
    // Storage disabled/full/unavailable (e.g. private browsing) - the
    // in-memory state still works for the rest of this session, it just
    // won't survive a reload.
  }
}

const CHECK_ICON =
  '<svg class="check-icon" viewBox="0 0 16 16"><path d="M3 8.5L6.5 12L13 4.5" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Checking off a task doesn't report it to TickTick right away - the row
// just shows checked/struck-through optimistically, and the actual
// complete_task call is delayed by this long. Unchecking it again before
// the delay elapses cancels the pending call entirely (it's never reported
// at all), rather than reporting it immediately and trying to undo an
// already-irreversible completion afterward.
const COMPLETION_REPORT_DELAY_MS = 60000;

function escapeHtml(value) {
  // Escapes quotes too (not just <, >, &) since this is used both in text
  // content and inside double-quoted HTML attributes built via template
  // strings below (e.g. tag names, task ids sourced from the TickTick API).
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkify(escapedText) {
  return escapedText.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">$1</a>'
  );
}

const MARKDOWN_LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

function renderText(value) {
  // TickTick descriptions/titles can carry markdown-style links, e.g.
  // "[How to share a list](https://...)" - shown as-is those brackets
  // and the raw URL would just be noise, so they're rendered as a plain
  // clickable link (label only) instead. Runs before escapeHtml/linkify so
  // the raw '[' ']' '(' ')' syntax chars are consumed here, not escaped.
  const raw = String(value ?? "");
  let result = "";
  let lastIndex = 0;
  MARKDOWN_LINK_RE.lastIndex = 0;
  let match;
  while ((match = MARKDOWN_LINK_RE.exec(raw))) {
    const [full, label, url] = match;
    result += linkify(escapeHtml(raw.slice(lastIndex, match.index)));
    result += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${escapeHtml(label)}</a>`;
    lastIndex = match.index + full.length;
  }
  result += linkify(escapeHtml(raw.slice(lastIndex)));
  return result;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(iso) {
  // TickTick sends due dates as an ISO string with a UTC offset (e.g.
  // "2026-08-07T00:00:00+0200"). Parsing that with `new Date(iso)` and then
  // reading it back with the viewer's LOCAL getters can roll the calendar
  // day backward or forward by one whenever the offsets don't line up
  // (exactly the "shows Aug 6 instead of Aug 7" bug). The calendar day
  // TickTick actually means is the one written before the offset, so read
  // those Y-M-D digits directly and build a local-midnight Date from them,
  // never letting the offset shift the day at all.
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    const fallback = new Date(iso);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function parseDueDate(iso) {
  // Due dates specifically still land one calendar day early even after
  // reading the Y-M-D digits verbatim (TickTick's API encodes them a day
  // back of the intended day for this account/timezone) - nudge just the
  // due-date reading forward by one day to compensate. start_date isn't
  // affected, so this stays separate from the generic parseLocalDate used
  // there.
  const date = parseLocalDate(iso);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return date;
}

function computeBucket(dueDateIso, now) {
  const due = parseDueDate(dueDateIso);
  if (!due) return "noDate";
  const diffDays = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / 86400000
  );
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "next7";
  return "later";
}

function formatParsedDate(date, language) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(language || undefined, {
      day: "numeric",
      month: "short",
    }).format(date);
  } catch (err) {
    return date.toLocaleDateString();
  }
}

function formatDate(iso, language) {
  return formatParsedDate(parseLocalDate(iso), language);
}

function formatDueDate(iso, language) {
  return formatParsedDate(parseDueDate(iso), language);
}

function formatDueLabel(iso, now, language) {
  // Mirrors the TickTick app's own due-date wording: Heute/Morgen, then the
  // weekday name through the rest of "next 7 days", then the plain date
  // (unchanged) for anything further out - overdue items also keep the
  // plain date, matching the reference screenshot.
  const date = parseDueDate(iso);
  if (!date) return "";
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000
  );
  if (diffDays === 0) return t("bucketToday", language);
  if (diffDays === 1) return t("bucketTomorrow", language);
  if (diffDays > 1 && diffDays <= 7) {
    try {
      return new Intl.DateTimeFormat(language || undefined, { weekday: "short" }).format(date);
    } catch (err) {
      return formatParsedDate(date, language);
    }
  }
  return formatParsedDate(date, language);
}

function isNoteItem(item, projectKind) {
  // TickTick's item.kind can mark an individual item as note-style even
  // inside an otherwise TASK-kind project - but only kind:"NOTE" means
  // that. "TEXT" and "CHECKLIST" are both still checkable tasks (a plain
  // task vs. one with sub-items), just without a checklist body. Purely
  // additive on top of the project-level check (never turns a note-project
  // item back into a checkbox).
  return projectKind === "NOTE" || item.kind === "NOTE";
}

function capitalize(str) {
  // Display-only: TickTick tags come back lowercase, but grouping/filter
  // matching still compares the raw values, so this is never applied to
  // sortValue/data-filter-value, only to what's shown on screen.
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function firstTag(item) {
  if (!item.tags || !item.tags.length) return null;
  return item.tags.slice().sort((a, b) => a.localeCompare(b))[0];
}

const TAG_COLOR_PALETTE = [
  "#e53935", // red
  "#fb8c00", // orange
  "#fdd835", // yellow
  "#7cb342", // light green
  "#43a047", // green
  "#00897b", // teal
  "#00acc1", // cyan
  "#039be5", // light blue
  "#3949ab", // indigo
  "#8e24aa", // purple
  "#d81b60", // pink
  "#f4511e", // deep orange
];

function tagColor(tag) {
  // Deterministic per-tag color (same tag always gets the same swatch,
  // independent of item/row), picked from a hand-picked vivid palette
  // rather than a raw hash-to-hue mapping - two tags landing on nearby
  // hues (e.g. 3deg apart) would look nearly identical, so this always
  // lands on one of a fixed set of clearly distinguishable colors.
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length];
}

function renderTagSquares(tags) {
  if (!tags || !tags.length) return "";
  return `<div class="tag-squares">${tags
    .map(
      (t) =>
        `<span class="tag-square" style="background:${tagColor(t)}" title="${escapeHtml(capitalize(t))}"></span>`
    )
    .join("")}</div>`;
}

function sortValue(item, key) {
  switch (key) {
    case "dueDate":
      return item.due_date ? new Date(item.due_date).getTime() : null;
    case "startDate":
      return item.start_date ? new Date(item.start_date).getTime() : null;
    case "priority":
      return item.priority_value ?? 0;
    case "title":
      return (item.title || "").toLocaleLowerCase();
    case "tag":
      return firstTag(item);
    default:
      return null;
  }
}

function compareBy(key, direction, language) {
  const factor = direction === "desc" ? -1 : 1;
  // Plain `<`/`>` on strings compares raw UTF-16 code units, which sorts
  // German umlauts (ä/ö/ü) after 'z' instead of near a/o/u - looks
  // "unsorted" for tag/title values in particular. A locale-aware collator
  // fixes that; only string sortValues (tag, title) hit this path at all.
  const collator = new Intl.Collator(language || undefined, { sensitivity: "base" });

  if (key === "tag") {
    // Multi-tag items always cluster together at the top, ahead of
    // single-tag and no-tag items - unconditionally (not flipped by
    // direction: this key is only ever used as a secondary/tie-break sort,
    // whose direction is its own fixed default, never the shared
    // "Reihenfolge" toggle). Only the alphabetical order *within* each of
    // those two clusters honors that direction.
    return (a, b) => {
      const aMulti = (a.tags?.length || 0) > 1 ? 0 : 1;
      const bMulti = (b.tags?.length || 0) > 1 ? 0 : 1;
      if (aMulti !== bMulti) return aMulti - bMulti;
      const va = firstTag(a);
      const vb = firstTag(b);
      if (va === null && vb === null) return 0;
      if (va === null) return 1; // items with no value always sort last
      if (vb === null) return -1;
      return collator.compare(va, vb) * factor;
    };
  }

  return (a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    const aEmpty = va === null || va === undefined || va === "";
    const bEmpty = vb === null || vb === undefined || vb === "";
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1; // items with no value always sort last
    if (bEmpty) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return collator.compare(va, vb) * factor;
    }
    if (va < vb) return -1 * factor;
    if (va > vb) return 1 * factor;
    return 0;
  };
}

function defaultSecondaryDirection(key) {
  // "Ascending" numerically means high-priority-last, which reads backwards
  // as a tie-breaker (you'd expect the more urgent item first even without
  // touching the shared "Reihenfolge" direction toggle) - every other key's
  // natural ascending order (earliest date, A-Z) already reads correctly.
  return key === "priority" ? "desc" : "asc";
}

function combinedCompare(primaryKey, direction, secondaryKey, language) {
  const primaryCmp = compareBy(primaryKey, direction, language);
  const secondaryCmp = compareBy(secondaryKey, defaultSecondaryDirection(secondaryKey), language);
  return (a, b) => {
    const primary = primaryCmp(a, b);
    return primary !== 0 ? primary : secondaryCmp(a, b);
  };
}

class TickTickListCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // id -> { ts, timerId }: ts is when it was checked off (Date.now()),
    // timerId is the pending setTimeout that actually reports the
    // completion to TickTick once COMPLETION_REPORT_DELAY_MS elapses -
    // cancelled (and never fired) if unchecked again before then.
    this._localCompleted = new Map();
    this._filters = null;
    this._menuOpen = false;
    this._menuField = null; // null = root menu, else "group" | "sort" | "order" | "filter"
    this._detailItem = null;
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
  }

  disconnectedCallback() {
    for (const entry of this._localCompleted.values()) {
      clearTimeout(entry.timerId);
    }
  }

  setConfig(config) {
    // Deliberately does not throw on a missing entity: the card picker and
    // the visual editor both render a live preview of the card before the
    // user has chosen an entity, and a thrown error there can leave those
    // dialogs stuck rather than showing a helpful placeholder.
    const cfg = config || {};
    this._config = cfg;
    // The user's live choices (from a previous session, or from before this
    // element got torn down and recreated) take priority over the YAML
    // defaults below - those defaults only ever apply the very first time a
    // given entity's card is used.
    const stored = loadStoredState(cfg.entity) || {};
    this._sortBy = stored.sortBy || cfg.sort_by || "dueDate";
    this._sortBySecondary = stored.sortBySecondary || cfg.sort_by_secondary || "title";
    this._sortDirection =
      stored.sortDirection || (cfg.sort_direction === "desc" ? "desc" : "asc");
    this._filters = {
      priority: new Set(stored.filterPriority || cfg.filter_priority || []),
      tags: new Set(stored.filterTags || cfg.filter_tags || []),
      buckets: new Set(stored.filterDueBuckets || cfg.filter_due_buckets || []),
    };
    this._detailItem = null;
    // setConfig can land after hass already has (e.g. the visual editor's
    // live preview re-configuring an already-hass'd card element in place,
    // or config changing without a fresh custom-element instance) - the
    // hass setter below won't otherwise notice anything changed here (it
    // only reacts to the *entity's own state object* changing), so this is
    // the only path that would ever re-render for a config-only change.
    if (this._hass) this._render();
  }

  _persistState() {
    saveStoredState(this._config?.entity, {
      sortBy: this._sortBy,
      sortBySecondary: this._sortBySecondary,
      sortDirection: this._sortDirection,
      filterPriority: [...this._filters.priority],
      filterTags: [...this._filters.tags],
      filterDueBuckets: [...this._filters.buckets],
    });
  }

  getGridOptions() {
    // Sections-view sizing: at least 2 grid cells wide. Height is "auto" by
    // default (content dictates it), but the user can turn that off in the
    // card's own native HA "Layout" tab and pick a fixed row count - the
    // card fills whatever height that gives it and scrolls internally (see
    // the :host/ha-card/.list-body flex rules in _styles()).
    return { columns: 6, min_columns: 2, rows: "auto", min_rows: 2 };
  }

  set hass(hass) {
    // HA calls this setter on *every* state change anywhere in the whole
    // system, not just to this card's own entity - a plain unconditional
    // `this._render()` here means a full `shadowRoot.innerHTML` replacement
    // (destroying and recreating <ha-card> and everything under it) on
    // every single one of those, which on a busy instance can be many
    // times a second. Besides the wasted work, that's actively hostile to
    // anything reaching into this card's shadow root from outside and
    // touching that DOM directly - a theme-wide card-mod style targeting
    // ha-card, say - since a full re-render throws away whatever it
    // attached, every time, often faster than it can reapply. HA's own
    // state objects are immutable and only get a new reference when that
    // exact entity's state actually changes, so comparing references (not
    // deep-equality) is the standard, cheap way to detect "did anything
    // this card actually reads change" - locale is checked too since it
    // drives every _t()/Intl call in _render() but isn't part of any
    // entity's state object.
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._config) return;
    const entity = this._config.entity;
    const stateChanged = !oldHass || oldHass.states[entity] !== hass.states[entity];
    const localeChanged = oldHass?.locale?.language !== hass?.locale?.language;
    if (stateChanged || localeChanged) this._render();
  }

  getCardSize() {
    const items = this._entityItems();
    return 1 + Math.max(1, Math.ceil((items ? items.length : 3) / 2));
  }

  static getStubConfig(hass) {
    // Entity ids are derived from the TickTick list's own name (e.g.
    // sensor.haushalt), not a "ticktick_" prefix, so pick the first sensor
    // that carries our sensor's signature attribute instead of guessing a
    // naming pattern.
    if (!hass) return { entity: "" };
    const first = Object.keys(hass.states).find(
      (e) => e.startsWith("sensor.") && hass.states[e].attributes.project_kind !== undefined
    );
    return { entity: first || "" };
  }

  static getConfigElement() {
    return document.createElement("ticktick-list-card-editor");
  }

  _stateObj() {
    if (!this._hass || !this._config) return null;
    return this._hass.states[this._config.entity];
  }

  _t(key, ...args) {
    return t(key, this._hass?.locale?.language, ...args);
  }

  _entityItems() {
    const stateObj = this._stateObj();
    return stateObj?.attributes?.items || [];
  }

  _effectiveStatus(item) {
    return this._localCompleted.has(item.id) ? "completed" : item.status;
  }

  _visibleItems() {
    const items = this._entityItems();
    const { priority, tags, buckets } = this._filters;
    const now = new Date();

    return items.filter((item) => {
      if (priority.size && !priority.has(item.priority || "NONE")) return false;
      if (tags.size) {
        const itemTags = item.tags || [];
        if (!itemTags.some((t) => tags.has(t))) return false;
      }
      if (buckets.size) {
        const bucket = computeBucket(item.due_date, now);
        if (!buckets.has(bucket)) return false;
      }
      return true;
    });
  }

  _groupedItems(items) {
    const language = this._hass?.locale?.language;
    // Checked-off items don't just sink within whichever due-date/tag
    // group they'd otherwise fall into - they leave their group entirely
    // and collect in one "Completed" section at the very end of the whole
    // list, same as the reference app.
    const isDone = (item) => this._effectiveStatus(item) === "completed";
    const openItems = items.filter((item) => !isDone(item));
    const completedItems = items.filter(isDone);

    const groups = this._groupOpenItems(openItems, language);

    if (completedItems.length) {
      const cmp = compareBy(this._sortBySecondary, defaultSecondaryDirection(this._sortBySecondary), language);
      groups.push({
        label: this._t("completedGroup"),
        key: COMPLETED_GROUP_KEY,
        items: completedItems.slice().sort(cmp),
      });
    }

    return groups;
  }

  // Groups/sorts only the still-open items - completed ones are handled
  // separately by _groupedItems, which appends them as their own trailing
  // section instead of leaving them mixed into these groups.
  _groupOpenItems(items, language) {
    if (this._sortBy === "dueDate" || this._sortBy === "tag") {
      // Grouping already carries the primary key's own ordering (bucket
      // order / alphabetical tag order below), so the secondary key sorts
      // WITHIN each group directly rather than tie-breaking a whole-array
      // sort: due dates are nearly always distinct, so a tie-break would
      // rarely apply and the secondary key would barely affect anything.
      const secondaryCmp = compareBy(this._sortBySecondary, defaultSecondaryDirection(this._sortBySecondary), language);

      if (this._sortBy === "dueDate") {
        const now = new Date();
        const groups = new Map();
        for (const item of items) {
          const bucket = computeBucket(item.due_date, now);
          if (!groups.has(bucket)) groups.set(bucket, []);
          groups.get(bucket).push(item);
        }
        return BUCKET_ORDER.filter((b) => groups.has(b)).map((b) => ({
          label: this._t(BUCKET_LABEL_KEYS[b]),
          key: b,
          items: groups.get(b).slice().sort(secondaryCmp),
        }));
      }

      const groups = new Map();
      for (const item of items) {
        const tag = firstTag(item) || NO_TAG_KEY;
        if (!groups.has(tag)) groups.set(tag, []);
        groups.get(tag).push(item);
      }
      return [...groups.keys()]
        .sort((a, b) =>
          a === NO_TAG_KEY ? 1 : b === NO_TAG_KEY ? -1 : a.localeCompare(b)
        )
        .map((tag) => ({
          label: tag === NO_TAG_KEY ? this._t("noTag") : capitalize(tag),
          key: tag,
          color: tag === NO_TAG_KEY ? null : tagColor(tag),
          items: groups.get(tag).slice().sort(secondaryCmp),
        }));
    }

    const sorted = items
      .slice()
      .sort(combinedCompare(this._sortBy, this._sortDirection, this._sortBySecondary, language));
    return [{ label: null, key: "all", items: sorted }];
  }

  _onClick(ev) {
    // A click anywhere outside the open popup (and not on its own toggle
    // button) closes it first, then the click still falls through to
    // whatever else it was aimed at below (e.g. a row) - matching how a
    // dropdown menu normally behaves.
    if (
      this._menuOpen &&
      !ev.target.closest(".menu-popup") &&
      !ev.target.closest("#menu-toggle")
    ) {
      this._menuOpen = false;
      this._menuField = null;
      this._render();
    }

    // Close on the explicit close button, or a click landing directly on
    // the backdrop itself (not bubbled from inside .detail-card).
    if (ev.target.closest(".detail-close") || ev.target.classList?.contains("detail-overlay")) {
      this._detailItem = null;
      this._render();
      return;
    }
    // The whole row is clickable (not just the checkbox), and is checked
    // before the general ".checkbox" handler below since the subtask
    // checkbox carries that class too (for shared styling).
    const subtaskRow = ev.target.closest(".subtask-row");
    if (subtaskRow) {
      const parentId = subtaskRow.dataset.parentId;
      const subtaskId = subtaskRow.dataset.subtaskId;
      const parent = this._entityItems().find((i) => i.id === parentId);
      const sub = parent?.items?.find((s) => s.id === subtaskId);
      if (parent && sub) this._toggleSubtask(parent, sub);
      return;
    }
    const checkbox = ev.target.closest(".checkbox");
    if (checkbox) {
      const id = checkbox.dataset.id;
      const items = this._entityItems();
      const item = items.find((i) => i.id === id);
      if (item) this._toggleComplete(item);
      return;
    }
    const row = ev.target.closest(".row");
    if (row && row.dataset.id) {
      const items = this._entityItems();
      const item = items.find((i) => i.id === row.dataset.id);
      if (item) {
        this._detailItem = item;
        this._render();
      }
      return;
    }
    if (ev.target.closest("#menu-toggle")) {
      this._menuOpen = !this._menuOpen;
      this._menuField = null;
      this._render();
      return;
    }
    const menuBack = ev.target.closest("[data-menu-back]");
    if (menuBack) {
      this._menuField = null;
      this._render();
      return;
    }
    const menuRow = ev.target.closest("[data-menu-row]");
    if (menuRow) {
      this._menuField = menuRow.dataset.menuRow;
      this._render();
      return;
    }
    const menuOption = ev.target.closest("[data-menu-option]");
    if (menuOption) {
      const field = menuOption.dataset.menuField;
      const value = menuOption.dataset.menuValue;
      if (field === "group") this._sortBy = value;
      else if (field === "sort") this._sortBySecondary = value;
      else if (field === "order") this._sortDirection = value;
      this._menuOpen = false;
      this._menuField = null;
      this._persistState();
      this._render();
      return;
    }
    // Filter chips are multi-select, so - unlike the single-choice sort
    // options above - picking one just toggles it and leaves the popup
    // open on the filter view for further adjustments.
    const filterChip = ev.target.closest("[data-filter-group]");
    if (filterChip) {
      const group = filterChip.dataset.filterGroup;
      const value = filterChip.dataset.filterValue;
      const set = this._filters[group];
      if (set.has(value)) set.delete(value);
      else set.add(value);
      this._persistState();
      this._render();
    }
  }

  _toggleComplete(item) {
    if (this._localCompleted.has(item.id)) {
      // Unchecking within COMPLETION_REPORT_DELAY_MS cancels the pending
      // complete_task call outright - if it hasn't fired yet, TickTick
      // never hears about this completion at all, so there's nothing to
      // "undo" server-side.
      clearTimeout(this._localCompleted.get(item.id).timerId);
      this._localCompleted.delete(item.id);
      this._render();
      return;
    }
    if (this._effectiveStatus(item) === "completed") return;
    const stateObj = this._stateObj();
    const projectId = stateObj?.attributes?.project_id;
    const timerId = setTimeout(() => {
      this._hass
        .callService("ticktick", "complete_task", {
          projectId,
          taskId: item.id,
        })
        .catch((err) => {
          this._localCompleted.delete(item.id);
          this._render();
          console.error("ticktick-list-card: failed to complete task", err);
        });
    }, COMPLETION_REPORT_DELAY_MS);
    this._localCompleted.set(item.id, { ts: Date.now(), timerId });
    this._render();
  }

  _toggleSubtask(parentItem, subItem) {
    // Same delayed-report pattern as _toggleComplete - and for the same
    // reason: there's no "uncomplete" API for checklist items either, so
    // reporting a completion immediately makes unchecking it again purely
    // cosmetic (it'd get reported to TickTick right at the click, and the
    // next data refresh would just show it checked again - "permanently
    // stuck checked" from the user's perspective). Delaying the report is
    // what makes undo actually mean something here.
    if (this._localCompleted.has(subItem.id)) {
      clearTimeout(this._localCompleted.get(subItem.id).timerId);
      this._localCompleted.delete(subItem.id);
      this._syncParentCompletion(parentItem);
      this._render();
      return;
    }
    if (subItem.status === "completed") return;
    const stateObj = this._stateObj();
    const projectId = stateObj?.attributes?.project_id;
    const timerId = setTimeout(() => {
      this._hass
        .callService("ticktick", "complete_subtask", {
          projectId,
          taskId: parentItem.id,
          itemId: subItem.id,
        })
        .catch((err) => {
          this._localCompleted.delete(subItem.id);
          this._syncParentCompletion(parentItem);
          this._render();
          console.error("ticktick-list-card: failed to complete checklist item", err);
        });
    }, COMPLETION_REPORT_DELAY_MS);
    this._localCompleted.set(subItem.id, { ts: Date.now(), timerId });
    this._syncParentCompletion(parentItem);
    this._render();
  }

  // Keeps the parent checklist task's own completed state in sync with its
  // sub-items: once every sub-item is (locally or already) completed, the
  // whole checklist is marked completed too - through the exact same
  // optimistic-mark-then-delayed-report flow as clicking its own checkbox,
  // so it's still undoable within COMPLETION_REPORT_DELAY_MS. Unchecking a
  // sub-item that breaks a full completion undoes the parent the same way.
  _syncParentCompletion(parentItem) {
    if (!parentItem.items || !parentItem.items.length) return;
    const allDone = parentItem.items.every(
      (sub) => this._localCompleted.has(sub.id) || sub.status === "completed"
    );
    const parentLocallyCompleted = this._localCompleted.has(parentItem.id);
    if (allDone !== parentLocallyCompleted) {
      this._toggleComplete(parentItem);
    }
  }

  _activeFilterCount() {
    const { priority, tags, buckets } = this._filters;
    return priority.size + tags.size + buckets.size;
  }

  _menuRowValueLabel(field) {
    if (field === "group") return this._t(SORT_LABEL_KEYS[this._sortBy]);
    if (field === "sort") return this._t(SORT_LABEL_KEYS[this._sortBySecondary]);
    if (field === "order") return this._t(DIRECTION_LABEL_KEYS[this._sortDirection]);
    const n = this._activeFilterCount();
    return n ? this._t("filterActiveCount", n) : this._t("filterAll");
  }

  _renderMenu() {
    if (!this._menuOpen) return "";

    if (!this._menuField) {
      return `<div class="menu-popup">
        ${MENU_FIELDS.map(
          ({ field, labelKey, icon }) => `
          <div class="menu-row" data-menu-row="${field}">
            <span class="menu-row-label"><ha-icon icon="${icon}"></ha-icon><span>${this._t(labelKey)}</span></span>
            <span class="menu-row-value">
              <span>${escapeHtml(this._menuRowValueLabel(field))}</span>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </span>
          </div>`
        ).join("")}
      </div>`;
    }

    if (this._menuField === "filter") {
      return this._renderFilterMenu();
    }

    const field = this._menuField;
    const fieldLabel = this._t(MENU_FIELDS.find((f) => f.field === field).labelKey);
    const currentValue =
      field === "order" ? this._sortDirection : field === "group" ? this._sortBy : this._sortBySecondary;
    const options =
      field === "order"
        ? [
            ["asc", this._t("directionAsc"), DIRECTION_ICONS.asc],
            ["desc", this._t("directionDesc"), DIRECTION_ICONS.desc],
          ]
        : SORT_KEYS.map((k) => [k, this._t(SORT_LABEL_KEYS[k]), SORT_KEY_ICONS[k]]);

    return `<div class="menu-popup">
      <div class="menu-back" data-menu-back="true">
        <ha-icon icon="mdi:chevron-left"></ha-icon>
        <span>${fieldLabel}</span>
      </div>
      ${options
        .map(
          ([value, label, icon]) => `
          <div class="menu-option ${value === currentValue ? "active" : ""}" data-menu-option="true" data-menu-field="${field}" data-menu-value="${value}">
            <span class="menu-row-label"><ha-icon icon="${icon}"></ha-icon><span>${escapeHtml(label)}</span></span>
            ${value === currentValue ? '<ha-icon icon="mdi:check" class="menu-check"></ha-icon>' : ""}
          </div>`
        )
        .join("")}
    </div>`;
  }

  _renderFilterMenu() {
    const tagSet = new Set();
    for (const item of this._entityItems()) {
      (item.tags || []).forEach((t) => tagSet.add(t));
    }

    return `<div class="menu-popup menu-popup-wide">
      <div class="menu-back" data-menu-back="true">
        <ha-icon icon="mdi:chevron-left"></ha-icon>
        <span>${this._t("menuFilter")}</span>
      </div>
      <div class="menu-filter-body">
        <div class="filter-group">
          <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.priority}"></ha-icon><span>${this._t("sortPriority")}</span></div>
          <div class="filter-chip-row">
            ${Object.keys(PRIORITY_LABEL_KEYS)
              .map(
                (p) =>
                  `<button class="chip ${this._filters.priority.has(p) ? "active" : ""}" style="--chip-color:var(--ticktick-priority-${p.toLowerCase()}-color)" data-filter-group="priority" data-filter-value="${p}">${this._t(PRIORITY_LABEL_KEYS[p])}</button>`
              )
              .join("")}
          </div>
        </div>
        ${
          tagSet.size
            ? `<div class="filter-group">
                <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.tag}"></ha-icon><span>${this._t("sortTag")}</span></div>
                <div class="filter-chip-row">
                  ${[...tagSet]
                    .sort((a, b) => a.localeCompare(b))
                    .map(
                      (t) =>
                        `<button class="chip ${this._filters.tags.has(t) ? "active" : ""}" style="--chip-color:${tagColor(t)}" data-filter-group="tags" data-filter-value="${escapeHtml(t)}">${escapeHtml(capitalize(t))}</button>`
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }
        <div class="filter-group">
          <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.due}"></ha-icon><span>${this._t("filterDue")}</span></div>
          <div class="filter-chip-row">
            ${BUCKET_ORDER.map(
              (b) =>
                `<button class="chip ${this._filters.buckets.has(b) ? "active" : ""}" data-filter-group="buckets" data-filter-value="${b}">${this._t(BUCKET_LABEL_KEYS[b])}</button>`
            ).join("")}
          </div>
        </div>
      </div>
    </div>`;
  }

  _renderRow(item, projectKind, excludeTag) {
    const status = this._effectiveStatus(item);
    const completed = status === "completed";
    const priority = (item.priority || "NONE").toLowerCase();
    const visibleTags = item.tags && item.tags.length
      ? excludeTag
        ? item.tags.filter((t) => t !== excludeTag)
        : item.tags
      : [];
    const hasContentLine = Boolean(item.content) || visibleTags.length > 0;

    if (isNoteItem(item, projectKind)) {
      return `<div class="row note-row" data-id="${escapeHtml(item.id)}">
        <div class="note-checkbox priority-${priority}" title="${escapeHtml(this._t("note"))}"><svg viewBox="0 0 16 16"><text x="50%" y="52%" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="700">N</text></svg></div>
        <div class="row-main">
          <div class="row-title">${renderText(item.title)}</div>
          ${
            hasContentLine
              ? `<div class="content-line">
            ${item.content ? `<div class="row-content clamp">${renderText(item.content)}</div>` : ""}
            ${renderTagSquares(visibleTags)}
          </div>`
              : ""
          }
        </div>
      </div>`;
    }

    const isOverdue = computeBucket(item.due_date, new Date()) === "overdue" && !completed;

    const hasChecklist = item.kind === "CHECKLIST";

    return `<div class="row task-row ${completed ? "completed" : ""}" data-id="${escapeHtml(item.id)}">
      <button class="checkbox priority-${priority} ${completed ? "checked" : ""}" data-id="${escapeHtml(item.id)}" title="${escapeHtml(this._localCompleted.has(item.id) ? this._t("reopen") : this._t("markComplete"))}">${completed ? CHECK_ICON : hasChecklist ? '<span class="checklist-lines"><span></span><span></span></span>' : ""}</button>
      <div class="row-main">
        <div class="row-title">${renderText(item.title)}</div>
        ${
          hasContentLine
            ? `<div class="content-line">
          ${item.content ? `<div class="row-content clamp">${renderText(item.content)}</div>` : ""}
          ${renderTagSquares(visibleTags)}
        </div>`
            : ""
        }
      </div>
      ${
        item.due_date
          ? `<div class="due ${isOverdue ? "overdue" : ""}">${formatDueLabel(item.due_date, new Date(), this._hass?.locale?.language)}</div>`
          : ""
      }
    </div>`;
  }

  _renderDetail(projectKind) {
    const item = this._detailItem;
    if (!item) return "";
    const status = this._effectiveStatus(item);
    const lang = this._hass?.locale?.language;

    const rows = [];
    if (item.content) {
      rows.push([this._t("detailContent"), renderText(item.content)]);
    }
    if (item.due_date) {
      rows.push([this._t("detailDue"), escapeHtml(formatDueDate(item.due_date, lang))]);
    }
    if (item.start_date) {
      rows.push([this._t("detailStart"), escapeHtml(formatDate(item.start_date, lang))]);
    }
    rows.push([this._t("sortPriority"), escapeHtml(this._t(PRIORITY_LABEL_KEYS[item.priority || "NONE"]))]);
    if (!isNoteItem(item, projectKind)) {
      rows.push([this._t("detailStatus"), status === "completed" ? this._t("statusCompleted") : this._t("statusOpen")]);
    }
    if (item.tags && item.tags.length) {
      rows.push([
        this._t("detailTags"),
        `<div class="tag-row">${item.tags.map((t) => `<span class="tag-chip" style="background:${tagColor(t)}">${escapeHtml(capitalize(t))}</span>`).join("")}</div>`,
      ]);
    }
    if (item.kind === "CHECKLIST" && item.items && item.items.length) {
      rows.push([this._t("detailChecklist"), this._renderSubtaskList(item)]);
    }

    return `<div class="detail-overlay">
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-title">${renderText(item.title)}</div>
          <button class="icon-btn detail-close" title="${escapeHtml(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="detail-body">
          ${rows.map(([label, value]) => `<div class="detail-row"><div class="detail-label">${label}</div><div>${value}</div></div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  _renderSubtaskList(item) {
    return `<div class="subtask-list">
      ${item.items
        .map((sub) => {
          const subCompleted = this._localCompleted.has(sub.id) || sub.status === "completed";
          return `<div class="subtask-row" data-parent-id="${escapeHtml(item.id)}" data-subtask-id="${escapeHtml(sub.id)}">
            <button class="checkbox subtask-checkbox ${subCompleted ? "checked" : ""}" title="${escapeHtml(this._localCompleted.has(sub.id) ? this._t("reopen") : this._t("markComplete"))}">${subCompleted ? CHECK_ICON : ""}</button>
            <span class="subtask-title ${subCompleted ? "completed" : ""}">${escapeHtml(sub.title)}</span>
          </div>`;
        })
        .join("")}
    </div>`;
  }

  _render() {
    if (!this._config) return;

    if (!this._config.entity) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card><div class="warning">${this._t("selectEntity")}</div></ha-card>`;
      return;
    }

    const stateObj = this._stateObj();

    if (!stateObj) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card><div class="warning">${this._t("entityNotFound", escapeHtml(this._config.entity))}</div></ha-card>`;
      return;
    }

    const projectKind = stateObj.attributes.project_kind === "NOTE" ? "NOTE" : "TASK";
    const title = this._config.title || stateObj.attributes.friendly_name || "";
    const visible = this._visibleItems();
    const groups = this._groupedItems(visible);

    const body = groups
      .map(
        (group) => `
        <div class="group">
          ${
            group.label
              ? `<div class="group-header">${
                  group.color
                    ? `<span class="group-header-tag" style="background:${group.color}">${escapeHtml(group.label)}</span>`
                    : escapeHtml(group.label)
                } <span class="count">${group.items.length}</span></div>`
              : ""
          }
          ${group.items
            .map((item) =>
              this._renderRow(item, projectKind, this._sortBy === "tag" ? group.key : null)
            )
            .join("")}
        </div>`
      )
      .join("");

    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card>
        <div class="header">
          <div class="title">${escapeHtml(title)}</div>
          <div class="controls">
            <button id="menu-toggle" class="icon-btn" title="${escapeHtml(this._t("sortAndFilter"))}"><ha-icon icon="mdi:tune"></ha-icon></button>
          </div>
          ${this._renderMenu()}
        </div>
        <div class="list-body">
          ${visible.length ? body : `<div class="empty">${this._t("noEntries")}</div>`}
        </div>
      </ha-card>
      ${this._renderDetail(projectKind)}`;
  }

  _styles() {
    return `<style>
      :host {
        --ticktick-priority-none-color: var(--secondary-text-color, #9e9e9e);
        --ticktick-priority-low-color: #4772fa;
        --ticktick-priority-medium-color: #ff9f0a;
        --ticktick-priority-high-color: #f2454a;
      }
      :host { display: block; height: 100%; }
      ha-card {
        /* ha-card already themes its own background/border/border-radius/
           box-shadow just by using the element - none of that needs
           setting here, it comes from the dashboard/theme automatically. */
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 4px 16px;
        position: relative;
        flex-shrink: 0;
      }
      .title {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .controls { display: flex; gap: 4px; }
      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 6px;
        border-radius: 6px;
        display: flex;
      }
      .icon-btn:hover { background: var(--divider-color); }
      #menu-toggle {
        /* The button's own padding otherwise insets the icon glyph past
           where the row divider lines end on the right - cancel exactly
           that padding so the icon lines up flush with them instead. */
        margin-right: -6px;
      }
      #menu-toggle ha-icon { --mdc-icon-size: 17px; }
      .menu-popup {
        position: absolute;
        top: 100%;
        right: 16px;
        margin-top: 6px;
        box-sizing: border-box;
        /* This popup is visually an extension of ha-card itself (it hangs
           directly off the card's own header), not a separate floating
           menu or a dialog - so unlike .detail-card below (a genuine modal,
           mirroring ha-dialog's tokens instead), it mirrors ha-card's own
           border/radius chain exactly (verified against the real HA
           frontend bundle), right down to the 1px border ha-card renders
           by default. A theme that reskins its cards' border/radius then
           reskins this popup's border/radius the same way. Background is
           its own fixed dark-glass look instead (see below), not mirrored
           from the theme. */
        /* Frosted glass, not a solid panel: an opaque background (ha-card's
           own real default) would make the blur below invisible - there'd
           be nothing showing through it to blur. Deliberately a fixed
           dark gray rather than the theme's own (possibly light) card
           color, so the frosted look stays consistent across themes
           instead of flipping to a white pane on light dashboards.
           Text/icon/divider colors inside the popup are locally
           overridden right below for the same reason - a fixed dark
           background needs fixed light text, not whatever --primary-
           text-color the active theme happens to use. */
        background: rgba(28, 28, 30, 0.8);
        --primary-text-color: #fff;
        --secondary-text-color: rgba(255, 255, 255, 0.7);
        --divider-color: rgba(255, 255, 255, 0.16);
        /* Real frosted-glass recipe (blur + a saturation boost so colors
           showing through don't just look washed-out gray): mirrors
           --ha-card-backdrop-filter so a theme's own explicit choice still
           wins, same as the box-shadow fallback below, but with a strong
           blur+saturate default instead of ha-card's real "none" - a plain
           blur alone reads muddy without the saturation boost. -webkit-
           prefix included because Safari still requires it for
           backdrop-filter to apply at all (verified against ha-card's own
           real CSS, which carries the same prefix for the same reason). */
        -webkit-backdrop-filter: var(--ha-card-backdrop-filter, blur(60px) saturate(200%));
        backdrop-filter: var(--ha-card-backdrop-filter, blur(60px) saturate(200%));
        border: var(--ha-card-border-width, 1px) solid
          var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
        color: var(--primary-text-color);
        /* --ha-card-box-shadow's own real default (verified against HA's
           frontend bundle) is "none" - fine for ha-card itself, but wrong
           here since this is an always-elevated overlay that needs visual
           separation from the page even when a theme flattens its cards.
           Reusing the variable still lets a theme's explicit box-shadow
           choice carry over; the fallback is our own elevation shadow, not
           the token's real default. */
        box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35));
        min-width: 240px;
        overflow: hidden;
        z-index: 50;
        font-size: 0.88em;
      }
      .menu-popup-wide { min-width: 270px; max-width: 310px; }
      .menu-row, .menu-option, .menu-back {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 14px;
        cursor: pointer;
      }
      .menu-row:hover, .menu-option:hover, .menu-back:hover {
        background: var(--divider-color);
      }
      .menu-row-label, .menu-row-value {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .menu-row-value { gap: 4px; color: var(--secondary-text-color); }
      .menu-row-label ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
      .menu-row-value ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
      .menu-back {
        justify-content: flex-start;
        font-weight: 500;
        border-bottom: 1px solid var(--divider-color);
      }
      .menu-back ha-icon { --mdc-icon-size: 17px; }
      .menu-option.active { color: var(--primary-color); }
      .menu-option.active .menu-row-label ha-icon { color: var(--primary-color); }
      .menu-check { --mdc-icon-size: 17px; color: var(--primary-color); }
      .menu-filter-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 14px;
        max-height: 360px;
        overflow-y: auto;
      }
      .filter-group { display: flex; flex-direction: column; gap: 8px; }
      .filter-group-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      .filter-group-title ha-icon { --mdc-icon-size: 16px; }
      .filter-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip {
        border: 1px solid var(--divider-color);
        background: none;
        border-radius: 8px;
        padding: 9px 14px;
        min-height: 38px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        color: var(--primary-text-color);
        font-size: 0.95em;
      }
      /* Priority/tag chips set --chip-color inline (priority: the same
         --ticktick-priority-*-color used for the checkboxes; tag: that
         tag's own palette swatch) so an active chip reads as "this
         priority/tag" at a glance. Chips without a --chip-color (the
         Fälligkeit/due-bucket group) fall back to the plain accent color. */
      .chip.active { background: var(--chip-color, var(--primary-color)); color: var(--text-primary-color, #fff); border-color: var(--chip-color, var(--primary-color)); }
      .list-body {
        padding: 4px 0 8px 0;
        flex: 1;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        /* Row content (hover highlights, dividers) reaches edge-to-edge,
           so without this it can paint past ha-card's own rounded bottom
           corners as a square instead of following them - the header
           above has no fill of its own, so the top corners already show
           ha-card's real background/rounding through untouched and don't
           need the same treatment. Scoped to just this element (not
           ha-card itself) so the sort/filter popup - anchored to the
           header, and taller than a short fixed-height card can be - stays
           free to overflow past the card's own bottom edge as before.
           --ha-card-border-radius itself falls back to the more general
           --ha-border-radius-lg design token (both default to 12px) if a
           theme doesn't set it directly - mirroring that exact chain here
           (rather than just falling straight to a hardcoded 12px) is what
           keeps this matching custom themes that only customize the more
           general token. */
        border-radius: 0 0 var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px))
          var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      }
      .group-header {
        padding: 8px 16px 4px 16px;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .group-header .count { font-weight: 400; opacity: 0.7; margin-left: 8px; }
      .group-header-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        color: #fff;
      }
      .row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        /* No bottom padding here (unlike the top) - row-main's own
           padding-bottom+border below is the only spacing after the
           divider line, so .row's box starts exactly at the line above it
           (the previous row's border) and ends exactly at its own line,
           with no extra dead space on either side. */
        padding: 8px 16px 0 16px;
        cursor: pointer;
        position: relative;
        /* Without this, .row (position:relative but z-index:auto) doesn't
           establish its own stacking context, so the ::before's z-index:-1
           below escapes it entirely and paints behind ha-card's own opaque
           background instead of just behind this row's own content -
           making the hover highlight invisible rather than just tucked
           behind the checkbox/text. */
        isolation: isolate;
      }
      /* The hover highlight is a separate layer covering .row's own box
         (which, per the padding note above, spans from the divider line
         above this row to this row's own divider line below), extended 1px
         further up to paint over that upper line too - same color as the
         line itself, so it reads as one continuous highlighted block
         instead of stopping just short of it. The row's OWN line below is
         a child (row-main)'s border, always painted on top of this layer
         regardless of extent, so only the upper line (a previous, already
         painted sibling) can actually be covered this way. z-index -1
         keeps it behind the row's normal-flow content (checkbox/row-main),
         painting only underneath it. */
      .row::before {
        content: "";
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
      }
      .row:hover::before { background: var(--divider-color); }
      .row-main {
        flex: 1;
        min-width: 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      .row:last-child .row-main { border-bottom: none; }
      /* The hover overlay above already paints over the line ABOVE this
         row (it extends 1px past its own top edge for exactly that). This
         row's OWN line is a child (row-main)'s border though, which always
         paints on top of the row's own background/pseudo regardless of
         z-index - color-swapping it to transparent (not removing it, to
         avoid a layout shift) is the only way to hide that one too, so a
         hovered row reads as one clean block with no border seams at all. */
      .row:hover .row-main { border-bottom-color: transparent; }
      .row-title { color: var(--primary-text-color); word-break: break-word; }
      .row-content { color: var(--secondary-text-color); font-size: 0.88em; margin-top: 2px; word-break: break-word; }
      .row-content.clamp {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .row-content a, .row-title a, .detail-title a, .detail-body a {
        color: var(--primary-color);
        text-decoration: none;
      }
      .task-row.completed .row-title { text-decoration: line-through; color: var(--secondary-text-color); }
      .content-line { display: flex; align-items: center; gap: 8px; min-width: 0; margin-top: 2px; }
      .content-line .row-content { margin-top: 0; flex: 1; min-width: 0; }
      .tag-squares { display: flex; gap: 4px; flex-shrink: 0; margin-left: auto; }
      .tag-square { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
      .checkbox, .note-checkbox {
        font: inherit;
        box-sizing: border-box;
        width: 1em;
        height: 1em;
        min-width: 1em;
        border-radius: 5px;
        border: 1px solid var(--ticktick-priority-none-color);
        background: color-mix(in srgb, var(--ticktick-priority-none-color) 8%, transparent);
        color: var(--ticktick-priority-none-color);
        margin-top: 2px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .checkbox { cursor: pointer; }
      .note-checkbox { cursor: default; }
      .note-checkbox svg {
        width: 62%;
        height: 62%;
        overflow: visible;
      }
      .note-checkbox svg text { font-size: 22px; }
      .checklist-lines { display: flex; flex-direction: column; gap: 0.16em; width: 55%; margin-left: 0.1em; }
      .checklist-lines span { display: block; height: 1px; background: currentColor; border-radius: 0; }
      .checkbox.checked .checklist-lines span { background: var(--card-background-color, #fff); }
      /* Only ever rendered on a checked checkbox, so the checkmark can
         always be the light color that reads against the solid
         priority-colored fill .checkbox.checked gets below. */
      .check-icon { width: 62%; height: 62%; overflow: visible; }
      .check-icon path { stroke: var(--card-background-color, #fff); }
      .checkbox.priority-low, .note-checkbox.priority-low {
        border-color: var(--ticktick-priority-low-color);
        background: color-mix(in srgb, var(--ticktick-priority-low-color) 8%, transparent);
        color: var(--ticktick-priority-low-color);
      }
      .checkbox.priority-medium, .note-checkbox.priority-medium {
        border-color: var(--ticktick-priority-medium-color);
        background: color-mix(in srgb, var(--ticktick-priority-medium-color) 8%, transparent);
        color: var(--ticktick-priority-medium-color);
      }
      .checkbox.priority-high, .note-checkbox.priority-high {
        border-color: var(--ticktick-priority-high-color);
        background: color-mix(in srgb, var(--ticktick-priority-high-color) 8%, transparent);
        color: var(--ticktick-priority-high-color);
      }
      .checkbox.checked { background: var(--ticktick-priority-none-color); }
      .checkbox.priority-low.checked { background: var(--ticktick-priority-low-color); }
      .checkbox.priority-medium.checked { background: var(--ticktick-priority-medium-color); }
      .checkbox.priority-high.checked { background: var(--ticktick-priority-high-color); }
      .due {
        font-size: 0.82em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        position: absolute;
        top: 8px;
        right: 16px;
      }
      .due.overdue { color: var(--error-color, #db4437); }
      .tag-row { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
      .tag-chip {
        color: #fff;
        border-radius: 10px;
        padding: 1px 8px;
        font-size: 0.78em;
      }
      .empty, .warning { padding: 16px; color: var(--secondary-text-color); }
      .detail-overlay {
        position: fixed;
        inset: 0;
        /* Mirrors HA's own ha-dialog scrim exactly (verified against the
           real frontend bundle): a themeable color layer (defaulting to
           transparent, same as HA's own default) plus a brightness dip on
           whatever is behind it, rather than a flat hardcoded black
           overlay - so a theme that recolors its dialog scrim (dark/AMOLED
           themes commonly do) affects this overlay the same way it affects
           every native HA dialog. */
        background-color: var(--mdc-dialog-scrim-color, transparent);
        backdrop-filter: var(--ha-dialog-scrim-backdrop-filter, brightness(68%));
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 16px;
        box-sizing: border-box;
      }
      .detail-card {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        /* This overlay is a genuine modal dialog, not card chrome - so it
           mirrors ha-dialog's own radius chain (verified against the real
           frontend bundle) rather than ha-card's. --ha-dialog-border-radius
           falls back to the more general --ha-border-radius-2xl token,
           which defaults to 20px (not 12px) - mirroring the full chain
           keeps this matching a theme that only customizes the general
           token, same reasoning as .list-body's border-radius below. */
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px));
        max-width: 480px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        /* Same reasoning as .menu-popup's box-shadow above: --ha-card-box-
           shadow's real default is "none", so the fallback here is our own
           elevation shadow, not the token's actual default - kept
           identical to .menu-popup's fallback so the two overlays read as
           part of the same visual language. */
        box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35));
      }
      .detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        padding: 16px 16px 8px 16px;
        position: sticky;
        top: 0;
        background: inherit;
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px))
          var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px)) 0 0;
      }
      .detail-title { font-size: 1.15em; font-weight: 500; word-break: break-word; }
      .detail-body { padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 12px; }
      .detail-row { font-size: 0.95em; }
      .detail-label { color: var(--secondary-text-color); font-size: 0.8em; margin-bottom: 2px; }
      .subtask-list { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
      .subtask-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
      .subtask-title { color: var(--primary-text-color); word-break: break-word; }
      .subtask-title.completed { text-decoration: line-through; color: var(--secondary-text-color); }
    </style>`;
  }
}

class TickTickListCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _t(key) {
    return t(key, this._hass?.locale?.language);
  }

  _schema() {
    // Sort/filter defaults are configured live in the card's own popup menu
    // instead (see MENU_FIELDS). Height/width live in HA's own native
    // "Layout" tab (via getGridOptions() on the card), not here - the card
    // just fills whatever height that tab gives it (see _styles()).
    return [
      { name: "entity", selector: { entity: { domain: "sensor", integration: "ticktick" } } },
      { name: "title", selector: { text: {} } },
    ];
  }

  _labels() {
    return {
      entity: this._t("editorEntity"),
      title: this._t("editorTitle"),
    };
  }

  _render() {
    if (!this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        this._config = ev.detail.value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config } })
        );
      });
      this.innerHTML = "";
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config || {};
    this._form.schema = this._schema();
    this._form.computeLabel = (schemaItem) => this._labels()[schemaItem.name] || schemaItem.name;
  }
}

customElements.define("ticktick-list-card", TickTickListCard);
customElements.define("ticktick-list-card-editor", TickTickListCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ticktick-list-card",
  name: "TickTick List",
  // The card picker isn't tied to any specific dashboard/entity here, so
  // there's no hass.locale to read - the browser's own language is the
  // best available signal for this one description string.
  description: t("cardDescription", typeof navigator !== "undefined" ? navigator.language : undefined),
});
