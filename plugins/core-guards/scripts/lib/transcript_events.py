"""Tracked tool-call event extraction for the Codex rollout JSONL transcript."""

import json

TRACKED_PAYLOAD_TYPES = {
    "function_call", "tool_search_call", "web_search_call",
}
TRACKED_NAMES = {
    "read_file", "exec_command", "shell_command", "web_search",
    "apply_patch", "spawn_agent", "wait_agent", "imagegen",
    "view_image", "tool_search", "_search",
}


def extract_event(line):
    """Return a normalized event dict if the line is a tracked tool call."""
    try:
        data = json.loads(line)
    except (json.JSONDecodeError, ValueError):
        return None
    payload = data.get("payload") or {}
    ptype = payload.get("type")
    if ptype not in TRACKED_PAYLOAD_TYPES:
        return None
    name = payload.get("name") or ptype.replace("_call", "")
    if name not in TRACKED_NAMES:
        return None
    return {
        "ts": data.get("timestamp"),
        "name": name,
        "payload_type": ptype,
        "arguments": payload.get("arguments"),
    }
