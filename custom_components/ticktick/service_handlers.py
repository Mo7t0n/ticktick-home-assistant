"""Service Handlers for TickTick Integration."""

import asyncio
from collections.abc import Awaitable, Callable
from datetime import datetime
import logging
import time
from typing import Any, TypeVar
from zoneinfo import ZoneInfo

from custom_components.ticktick.ticktick_api_python.models.check_list_item import (
    TaskStatus,
)
from custom_components.ticktick.ticktick_api_python.models.task import (
    Task,
    TaskPriority,
)

from homeassistant.core import ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import ITEM_ID, PROJECT_ID, TASK_ID
from .ticktick_api_python.ticktick_api import TickTickAPIClient

_LOGGER = logging.getLogger(__name__)


# === Task Scope ===
async def handle_get_task(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'get_task' endpoint."""
    return await _create_handler(client.get_task, PROJECT_ID, TASK_ID)


async def handle_create_task(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'create_task' endpoint."""
    return await _create_handler(client.create_task, *(Task.get_arg_names()), type=Task)


async def handle_complete_task(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'complete_task' endpoint."""
    return await _create_handler(client.complete_task, PROJECT_ID, TASK_ID)


async def handle_delete_task(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'delete_task' endpoint."""
    return await _create_handler(client.delete_task, PROJECT_ID, TASK_ID)


async def handle_complete_subtask(client: TickTickAPIClient) -> Callable:
    """Return a handler function that completes one checklist item of a task.

    TickTick's API has no endpoint for completing a single checklist item -
    the whole task has to be fetched, the matching item's status flipped,
    and the task written back with update_task.
    """
    # Checking off several checklist items of the same task in quick
    # succession (the card's own dashboard flow, or just fast clicking)
    # fires overlapping calls here. Each does its own fetch-mutate-write on
    # the WHOLE task, so without serializing per task_id, two overlapping
    # calls can each fetch before the other's write lands and clobber one
    # another's change (or fail to find an item the other call just
    # completed - TickTick drops completed checklist items from the
    # response, same as it does with completed tasks).
    task_locks: dict[str, asyncio.Lock] = {}
    # Serializing isn't quite enough on its own: TickTick's GET can lag
    # behind a write that was JUST made for the same task (eventual
    # consistency), so a same-task call made moments after a sibling item's
    # write can still fetch a stale snapshot missing that sibling's
    # completion - and then overwrite it right back to incomplete. Caching
    # our own last-written snapshot per task and building the next mutation
    # on top of THAT (instead of re-fetching) sidesteps needing TickTick's
    # read path to reflect our own very recent write. Short TTL so it never
    # goes stale against changes made elsewhere (the TickTick app, etc.).
    task_cache: dict[str, tuple[float, Task]] = {}
    TASK_CACHE_TTL_SECONDS = 90

    async def handler(call: ServiceCall) -> dict[str, Any]:
        """Handle the complete_subtask service call."""
        project_id = call.data.get(PROJECT_ID)
        task_id = call.data.get(TASK_ID)
        item_id = call.data.get(ITEM_ID)

        if not project_id or not task_id or not item_id:
            raise HomeAssistantError(
                f"{PROJECT_ID}, {TASK_ID} and {ITEM_ID} are all required"
            )

        lock = task_locks.setdefault(task_id, asyncio.Lock())
        async with lock:
            try:
                cached = task_cache.get(task_id)
                if cached and (time.monotonic() - cached[0]) < TASK_CACHE_TTL_SECONDS:
                    existing_task = cached[1]
                else:
                    existing_task_response = await client.get_task(
                        project_id, task_id, returnAsJson=True
                    )
                    existing_task = Task.from_dict(existing_task_response)

                subitem = next(
                    (i for i in existing_task.items if i.id == item_id), None
                )
                if subitem is None:
                    # Most likely already completed (and dropped from the
                    # response) by an earlier call for this same item - the
                    # end state the caller wants is already true, so treat
                    # it as a no-op success rather than surfacing an error
                    # for something that isn't actually wrong anymore. Drop
                    # any cached snapshot too, since it clearly isn't the
                    # one that actually matches this item's real history.
                    task_cache.pop(task_id, None)
                    _LOGGER.debug(
                        "Checklist item %s not found on task %s - "
                        "assuming already completed",
                        item_id,
                        task_id,
                    )
                    return {"data": {}}
                subitem.status = TaskStatus.COMPLETED

                response = await client.update_task(existing_task, returnAsJson=True)
                task_cache[task_id] = (time.monotonic(), existing_task)
                return {"data": response}  # noqa: TRY300
            except HomeAssistantError:
                raise
            except Exception as e:  # noqa: BLE001
                # The write may or may not have actually landed - don't
                # keep building on a snapshot we're no longer sure about.
                task_cache.pop(task_id, None)
                _LOGGER.exception("Failed to complete checklist item")
                raise HomeAssistantError(str(e)) from e

    return handler


async def handle_update_task(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'update_task' endpoint."""

    async def handler(call: ServiceCall) -> dict[str, Any]:
        """Handle the update_task service call."""
        project_id = call.data.get(PROJECT_ID)
        task_id = call.data.get(TASK_ID)

        if not project_id or not task_id:
            raise HomeAssistantError(
                f"{PROJECT_ID} and {TASK_ID} are both required"
            )

        try:
            existing_task_response = await client.get_task(
                project_id, task_id, returnAsJson=True
            )
            existing_task = Task.from_dict(existing_task_response)
            _LOGGER.debug("Retrieved existing task: %s", existing_task.title)

            # Only the fields provided in the service call are updated.
            if "title" in call.data:
                existing_task.title = call.data.get("title")

            if "content" in call.data and "desc" in call.data:
                _LOGGER.warning(
                    "Both 'content' and 'desc' fields provided. Using 'content' field."
                )
                existing_task.content = call.data.get("content")
                existing_task.desc = call.data.get("desc")
            elif "content" in call.data:
                existing_task.content = call.data.get("content")
            elif "desc" in call.data:
                existing_task.content = call.data.get("desc")
                existing_task.desc = call.data.get("desc")

            if "dueDate" in call.data:
                due_date = call.data.get("dueDate")
                time_zone = call.data.get("timeZone")
                existing_task.dueDate = (
                    _sanitize_date(due_date, time_zone)
                    if isinstance(due_date, str)
                    else due_date
                )

            if "isAllDay" in call.data:
                existing_task.isAllDay = call.data.get("isAllDay")

            if "startDate" in call.data:
                start_date = call.data.get("startDate")
                time_zone = call.data.get("timeZone")
                existing_task.startDate = (
                    _sanitize_date(start_date, time_zone)
                    if isinstance(start_date, str)
                    else start_date
                )

            if "repeatFlag" in call.data:
                existing_task.repeatFlag = call.data.get("repeatFlag")

            if "reminders" in call.data:
                reminders = call.data.get("reminders")
                if reminders is None:
                    existing_task.reminders = []
                elif isinstance(reminders, list):
                    existing_task.reminders = reminders
                else:
                    existing_task.reminders = [reminders]

            if "priority" in call.data:
                priority = call.data.get("priority")
                if isinstance(priority, str):
                    try:
                        existing_task.priority = TaskPriority[priority]
                    except KeyError:
                        _LOGGER.warning("Invalid priority value: %s. Ignoring.", priority)
                else:
                    existing_task.priority = priority

            if "sortOrder" in call.data:
                existing_task.sortOrder = call.data.get("sortOrder")

            if "tags" in call.data:
                tags = call.data.get("tags")
                if tags is None:
                    existing_task.tags = []
                else:
                    existing_task.tags = tags if isinstance(tags, list) else [tags]

            response = await client.update_task(existing_task, returnAsJson=True)
            return {"data": response}  # noqa: TRY300
        except HomeAssistantError:
            raise
        except Exception as e:  # noqa: BLE001
            _LOGGER.exception("Failed to update task")
            raise HomeAssistantError(str(e)) from e

    return handler


# === Project Scope ===
async def handle_get_projects(client: TickTickAPIClient) -> Callable:
    """Return a handler function for the 'get_projects' endpoint."""
    return await _create_handler(client.get_projects)


T = TypeVar("T")


async def _create_handler(
    client_method: Callable[..., Awaitable[Any]],
    *arg_names: str,
    type: type[T] | None = None,
) -> Callable:
    """Create a reusable handler function for TickTick API endpoints."""

    async def handler(call: ServiceCall) -> dict[str, Any]:
        """Return a generic handler for TickTick API endpoints."""

        args = {arg: call.data.get(arg) for arg in arg_names}
        try:
            response = None
            if type == Task:
                if "dueDate" in args and isinstance(args["dueDate"], str):
                    args["dueDate"] = _sanitize_date(args["dueDate"], args["timeZone"])
                if "startDate" in args and isinstance(args["startDate"], str):
                    args["startDate"] = _sanitize_date(
                        args["startDate"], args["timeZone"]
                    )
                if "priority" in args and isinstance(args["priority"], str):
                    try:
                        args["priority"] = TaskPriority[args["priority"]]
                    except Exception:
                        args["priority"] = None
                instance = type(**args)
                response = await client_method(instance, returnAsJson=True)
            else:
                response = await client_method(**args, returnAsJson=True)

            return {"data": response}  # noqa: TRY300
        except Exception as e:  # noqa: BLE001
            # Raise instead of returning {"error": ...}: a caught-and-returned
            # error still looks like a successful service call to callers
            # (e.g. the bundled dashboard card's hass.callService(...).catch()
            # never fires), silently hiding failures like a failed complete_task.
            _LOGGER.exception("TickTick service call failed")
            raise HomeAssistantError(str(e)) from e

    return handler


def _sanitize_date(date: str, timeZone: str | None) -> str:
    """Sanitize a date string to the format expected by TickTick API."""
    naive_dt = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")

    if timeZone:
        zone_info = ZoneInfo(timeZone)
    else:
        zone_info = dt_util.get_default_time_zone()

    aware_dt = naive_dt.replace(tzinfo=zone_info)

    return aware_dt.strftime("%Y-%m-%dT%H:%M:%S%z")
