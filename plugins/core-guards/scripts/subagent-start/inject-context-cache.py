#!/usr/bin/env python3
"""SubagentStart: Inject available MCP cache list as additionalContext."""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _shared.cache_io import load_index
from _shared.state_manager import sanitize_session_id

CODEX_HOME = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))
BASE_DIR = os.path.join(CODEX_HOME, "fusengine-cache", "sessions")
DEFAULT_TTL_MIN = 30


def _ttl_minutes() -> int:
    """Return cache TTL in minutes from env FUSENGINE_CACHE_TTL_MIN or default."""
    raw = os.environ.get("FUSENGINE_CACHE_TTL_MIN", "").strip()
    try:
        val = int(raw)
        return val if val > 0 else DEFAULT_TTL_MIN
    except ValueError:
        return DEFAULT_TTL_MIN


def _is_fresh(ts_str: str, ttl_min: int) -> bool:
    """Return True if ISO ts is within ttl_min minutes from now."""
    try:
        ts = datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return False
    age_sec = (datetime.now(timezone.utc) - ts).total_seconds()
    return 0 <= age_sec <= ttl_min * 60


def _truncate(text: str, limit: int = 60) -> str:
    """Sanitize and truncate text for table cell."""
    text = (text or "").replace("|", "/").replace("\n", " ")
    return text if len(text) <= limit else text[: limit - 3] + "..."


def _render(entries: list) -> str:
    """Render fresh entries as a markdown injection block."""
    lines = [
        "# MCP cache available this session",
        "Before launching mcp__context7/exa, check whether the result is already cached.",
        "Read the .md file to recover the cached result.",
        "APEX: reading the MCP cache counts as satisfying research-expert.",
        "",
        "| Tool | Query | File |",
        "| --- | --- | --- |",
    ]
    for e in entries:
        lines.append(
            f"| {_truncate(e.get('tool', ''), 40)} | "
            f"{_truncate(e.get('query', ''), 60)} | "
            f"{_truncate(e.get('file', ''), 50)} |"
        )
    return "\n".join(lines)


def main() -> None:
    """Entry: read stdin event, emit cache table on stdout when fresh entries exist."""
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)
    try:
        sid = sanitize_session_id(data.get("session_id", "") or "unknown")
    except ValueError:
        sys.exit(0)

    index_path = os.path.join(BASE_DIR, sid, "context", "index.json")
    entries = load_index(index_path)
    if not entries:
        sys.exit(0)
    fresh = [e for e in entries if _is_fresh(e.get("ts", ""), _ttl_minutes())]
    if not fresh:
        sys.exit(0)
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "SubagentStart",
            "additionalContext": _render(fresh),
        }
    }
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
