"""The TickTick Integration integration."""

from __future__ import annotations

import datetime
import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig, async_import_module
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.helpers import aiohttp_client

from . import api
from .const import CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES, DOMAIN
from .coordinator import TickTickCoordinator
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


async def register_frontend_card(hass: HomeAssistant) -> None:
    """Register the bundled TickTick Lovelace card as a frontend resource."""
    if hass.data.get(DOMAIN, {}).get("frontend_registered"):
        return

    www_path = Path(__file__).parent / "www"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL_PATH, str(www_path), cache_headers=False)]
    )
    add_extra_js_url(hass, CARD_JS_URL)

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
