# Home Assistant TickTick Integration

Integration implements [TickTick Open API](https://developer.ticktick.com/docs#/openapi) with support for [To-do list](https://www.home-assistant.io/integrations/todo/) entities and exposes it as services in Home Assistant, allowing you to manage your tasks and projects programmatically.

This is a fork of [Hantick/ticktick-home-assistant](https://github.com/Hantick/ticktick-home-assistant), extended with note lists as sensors and a custom `ticktick-list-card` Lovelace card (see below).

## Installation

1. Navigate to [TickTick Developer](https://developer.ticktick.com/manage) and click `New App`
2. Name your app and set `OAuth redirect URL` to `https://my.home-assistant.io/redirect/oauth` or your instance url i.e `http://homeassistant.local:8123`
3. Add this repository in HACS and download TickTick Integration via HACS
4. In Settings → Devices & services, use the dotted menu to create new application credentials (`/config/application_credentials`). Enter the OAuth client ID and secret from the TickTick app here.
5. Your TickTick task lists should now each turn up as a todo list in Home Assistant, and **every** list (task lists and note lists alike) turns up as a `sensor.ticktick_*` entity.

If you don’t want all of your lists to show up, you can disable selected lists/sensors in the entities list
(enter selection mode → Disable selected).

## Lists as sensors ("variables")

Every TickTick list — task list or note list — gets a `sensor` entity, regardless of kind. The sensor's state is the item count, and its `items` attribute holds the full list content (title, content, due date, start date, priority, status, tags, kind, sort order, and — for a checklist-kind task — its own `items` array of checklist sub-items), so it's usable directly in Jinja templates/automations (`state_attr('sensor.your_list_name', 'items')`) as well as by the bundled dashboard card below. `project_kind` on the sensor is `TASK` or `NOTE`.

The entity id is derived from the TickTick list's own name (standard Home Assistant slugifying), not prefixed with `ticktick_` — e.g. a list called "Haushalt" becomes `sensor.haushalt`. Find the exact id under Settings → Devices & services → TickTick → entities, or Developer Tools → States (filter by the `ticktick` integration).

Note lists (`kind: NOTE` projects) only show up as sensors — they don't get a `todo` entity, since Home Assistant's to-do list model is checkbox-only and note items aren't checkable.

## Dashboard card

![Dashboard card](custom_components/ticktick/www/dashboard-card.png)

The integration bundles a `ticktick-list-card` Lovelace card (auto-registered as a frontend resource, no manual "Add resource" step needed) that renders a list the way the TickTick app does: a priority-colored checkbox ring and due-date grouping (Overdue/Today/Tomorrow/Next 7 days/Later) for task lists, or a note/tag-chip layout for note lists. Completed items collect in their own "Completed" section at the end of the list. The card's own UI text follows Home Assistant's language setting (German or English; anything else falls back to English) — this is separate from the item content itself, which is shown exactly as it comes from TickTick.

A single button opens a TickTick-style popup menu with four rows — **Group by** (also drives the visible grouping), **Sort by** (orders items within a group), **Order**, and **Filter** — each drilling into its own sub-view (with icons and a checkmark on the active choice for the first three, multi-select chips for priority/tag/due date under Filter). These are runtime choices made through the popup itself, not part of the visual card editor.

```yaml
type: custom:ticktick-list-card
entity: sensor.haushalt
```

The visual editor only exposes `entity` and `title`. `sort_by`/`sort_by_secondary`/`sort_direction` (the popup's starting defaults) can still be set by hand in YAML if you want a non-default starting view, just not through the GUI editor. Height and width aren't a card option at all — on a "sections" dashboard, use the card's own native **Layout** tab (entity picker dialog → Layout) to turn off "Automatische Höhe" and pick a fixed row count; the card fills whatever height that gives it and scrolls internally. It defaults to at least 2 grid columns wide and auto height.

Clicking a row's checkbox marks it complete; clicking a row's title/content opens a detail view with all its fields. Description text is clipped to 1 line in the list itself. A checklist-kind task (one with its own sub-items) gets a small list icon inside its checkbox, and its detail view lists each checklist item with its own clickable checkbox (there's no dedicated TickTick API for completing a single checklist item, so this fetches the task, flips that one item's status, and writes the task back).

Checking off a task (or checklist item) shows it as done right away, but the actual completion isn't reported to TickTick until a minute later — clicking it again before then cancels the report outright, since TickTick has no "reopen" endpoint to undo an already-sent completion with. A checklist task with all of its sub-items checked off completes itself the same way. Since TickTick's API never returns completed tasks, a reported completion then simply vanishes from the list on the next sync.

### Sync interval

The integration polls TickTick once a minute by default. To change that, go to Settings → Devices & services → TickTick → **Configure** and set a different interval (in minutes); the integration reloads automatically.

## Exposed Services

### Task Services

Get, Create, Update, Delete, Complete Task, Complete Checklist Item (sub-task)

### Project Services

Get (Create, Update, Delete are missing for now)

## Left to be done:

- Create/Update Task Service: `items` - The list of subtasks
- Create/Update Task Service: `reminders` - Can create some better builder for reminders
- Create/Update Task Service: `repeatFlag` - Can create some better builder for reminders
- Get Project By ID Service
- Get Project By ID With Data Service
- Create Project
- Update Project
- Delete Project
