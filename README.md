# Home Assistant TickTick Integration

Integration implements [TickTick Open API](https://developer.ticktick.com/docs#/openapi) with support for [To-do list](https://www.home-assistant.io/integrations/todo/) entities and exposes it as services in Home Assistant, allowing you to manage your tasks and projects programmatically.

This is a fork of [Hantick/ticktick-home-assistant](https://github.com/Hantick/ticktick-home-assistant) by [Hantick](https://github.com/Hantick), maintained by [Mo7t0n](https://github.com/Mo7t0n) with note lists as sensors and a custom `ticktick-list-card` Lovelace card.

## Installation

1. Navigate to [TickTick Developer](https://developer.ticktick.com/manage) and click `New App`
2. Name your app and set `OAuth redirect URL` to `https://my.home-assistant.io/redirect/oauth` or your instance url i.e `http://homeassistant.local:8123`
3. In HACS, open the menu → **Custom repositories**, add `https://github.com/Mo7t0n/ticktick-home-assistant` with type **Integration**, then download **TickTick** and restart Home Assistant.
4. In Settings → Devices & services, use the dotted menu to create new application credentials (`/config/application_credentials`). Enter the OAuth client ID and secret from the TickTick app here.
5. Add the **TickTick** integration under Settings → Devices & services → **Add integration** and sign in to TickTick.
6. Your TickTick task lists now turn up as todo lists, and every list (task lists and note lists alike) as a `sensor` entity in Home Assistant.

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
  - A touch-optimization option for kiosk/tablet dashboards: larger checkbox tap targets, non-clickable row-preview links, and links in the detail popup opening in a near-fullscreen preview — live, or an automatically extracted reader view for pages that block embedding (recipe ingredients/instructions where available, the description for YouTube videos).
  - Matches automatically your Home Assistant theme.

- **Configurable sync interval** — polls TickTick once a minute by default; adjustable under Settings → Devices & services → TickTick → **Configure**.

## Support

Found a bug or missing a feature? [Open an issue](https://github.com/Mo7t0n/ticktick-home-assistant/issues/new/choose).

## License

[GPL-3.0](LICENSE), same as the [upstream project](https://github.com/Hantick/ticktick-home-assistant).
