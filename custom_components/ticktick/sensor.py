from datetime import datetime
import logging
from typing import Any

from custom_components.ticktick.coordinator import TickTickCoordinator
from custom_components.ticktick.ticktick_api_python.models.check_list_item import (
    CheckListItem,
)
from custom_components.ticktick.ticktick_api_python.models.project import Kind
from custom_components.ticktick.ticktick_api_python.models.task import Task

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the TickTick sensor platform config entry."""
    coordinator: TickTickCoordinator = hass.data[DOMAIN][entry.entry_id]
    projects = await coordinator.async_get_projects()
    _LOGGER.debug("TickTick sensor platform: %d project(s) found", len(projects))
    async_add_entities(
        TickTickListSensor(coordinator, entry.entry_id, project.id, project.name)
        for project in projects
    )


def _iso(value: datetime | str | None) -> str | None:
    """Format a date value as an ISO string, handling different source types."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _serialize_subitem(item: CheckListItem) -> dict[str, Any]:
    """Convert a checklist sub-item into a JSON-ready dict."""
    return {
        "id": item.id,
        "title": item.title,
        "status": "completed" if item.status else "open",
        "sort_order": item.sortOrder,
    }


def _serialize_task(task: Task) -> dict[str, Any]:
    """Convert a Task into a JSON-ready dict for use as a sensor attribute."""
    return {
        "id": task.id,
        "title": task.title,
        "content": task.content,
        "desc": task.desc,
        "due_date": _iso(task.dueDate),
        "start_date": _iso(task.startDate),
        "priority": task.priority.name if task.priority else None,
        "priority_value": task.priority.value if task.priority else 0,
        "status": "completed" if task.status else "open",
        "tags": list(task.tags) if task.tags else [],
        "kind": task.kind.value if task.kind else None,
        "sort_order": task.sortOrder,
        "items": [_serialize_subitem(i) for i in task.items] if task.items else [],
    }


class TickTickListSensor(CoordinatorEntity[TickTickCoordinator], SensorEntity):
    """A sensor exposing a TickTick list (task or note) and its items."""

    _attr_native_unit_of_measurement = "items"

    def __init__(
        self,
        coordinator: TickTickCoordinator,
        config_entry_id: str,
        project_id: str,
        project_name: str,
    ) -> None:
        """Initialize TickTickListSensor."""
        super().__init__(coordinator=coordinator)
        self._project_id = project_id
        self._attr_unique_id = f"{config_entry_id}-{project_id}-list"
        self._attr_name = project_name
        self._attr_native_value = 0
        self._attr_extra_state_attributes = {}

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""

        projects_with_tasks = self.coordinator.data
        project_with_tasks = next(
            (
                p
                for p in (projects_with_tasks or [])
                if p.project.id == self._project_id
            ),
            None,
        )

        if project_with_tasks is not None:
            tasks = project_with_tasks.tasks or []
            project = project_with_tasks.project
            self._attr_icon = (
                "mdi:note-text-outline"
                if project.kind == Kind.NOTE
                else "mdi:checkbox-marked-circle-outline"
            )
            self._attr_native_value = len(tasks)
            self._attr_extra_state_attributes = {
                "project_id": project.id,
                "project_kind": project.kind.value if project.kind else Kind.TASK.value,
                "project_color": project.color,
                "items": [_serialize_task(task) for task in tasks],
            }

        super()._handle_coordinator_update()

    async def async_added_to_hass(self) -> None:
        """When entity is added to hass update state from existing coordinator data."""
        await super().async_added_to_hass()
        self._handle_coordinator_update()
