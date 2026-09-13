# Home Assistant TickTick Integration

Integration implements [TickTick Open API](https://developer.ticktick.com/docs#/openapi) with support for [To-do list](https://www.home-assistant.io/integrations/todo/) entities and exposes it as services in Home Assistant, allowing you to manage your tasks and projects programmatically.

This is a fork of [Hantick/ticktick-home-assistant](https://github.com/Hantick/ticktick-home-assistant) by [Hantick](https://github.com/Hantick), maintained by [Mo7t0n](https://github.com/Mo7t0n) with note lists as sensors and a custom `ticktick-list-card` Lovelace card.

## Installation

1. Navigate to [TickTick Developer](https://developer.ticktick.com/manage) and click `New App`
2. Name your app and set `OAuth redirect URL` to `https://my.home-assistant.io/redirect/oauth` or your instance url i.e `http://homeassistant.local:8123`
3. Add this repository in HACS and download TickTick Integration via HACS
4. In Settings → Devices & services, use the dotted menu to create new application credentials (`/config/application_credentials`). Enter the OAuth client ID and secret from the TickTick app here.
5. Your TickTick task lists now turn up as todo lists, and every list (task lists and note lists alike) as a `sensor` entity in Home Assistant.

## Features

- **Lists as sensors** — every TickTick list (task or note) gets a `sensor` entity with the item count as state and the full list content (title, due date, priority, tags, checklist items, ...) as the `items` attribute, usable in templates/automations.
- **Dashboard card** — bundled `ticktick-list-card` Lovelace card that renders a list like the TickTick app.

  ![Dashboard card](custom_components/ticktick/www/dashboard-card.png)

  ```yaml
  type: custom:ticktick-list-card
  entity: sensor.__name__
  ```

  - Sorting (due date, priority, start date, title, or tag) and filtering (priority, tag, due date), remembered per list.
  - Grouping by due-date bucket or by tag, with drag-and-drop reordering of tag group headings.
  - Checklist support, including completing individual sub-items.
  - A detail popup per item showing its content, checklist, tags (addable/removable right there), and other properties.
  - Links in the detail popup open a near-fullscreen preview — live, or an automatically extracted reader view (with recipe ingredients/instructions where available) for pages that block embedding.
  - A touch-optimization option for kiosk/tablet dashboards: larger checkbox tap targets and non-clickable row-preview links.
  - Matches automaticly your Home Assistant theme.

- **Configurable sync interval** — polls TickTick once a minute by default; adjustable under Settings → Devices & services → TickTick → **Configure**.

