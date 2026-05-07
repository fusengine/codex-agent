#!/usr/bin/env python3
"""PostToolUse hook: feed Codex native tool calls into the APEX session state.

Codex CLI does not fire hooks for read_file/web_search/exec_command. The
transcript-watcher background process records these in a JSONL file. This
hook runs after every Bash/apply_patch tool call (which DO fire) and
synchronizes the watcher's recent events into the session-state used by
require-apex-agents.py and friends.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _shared.state_manager import (  # noqa: E402
    load_session_state,
    save_session_state,
)
from lib.transcript_classifier import (  # noqa: E402
    categories_seen,
    read_events,
)

CODEX_HOME = Path(os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex")))
EVENTS_DIR = CODEX_HOME / "fusengine-cache" / "transcript-events"


def _now_iso():
    """Return ISO-8601 UTC timestamp ending in Z."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _ensure_agent(state, agent_type):
    """Add or refresh an APEX agent entry in session state."""
    agents = state.setdefault("agents", [])
    agents.append({
        "type": agent_type,
        "quality": "sufficient",
        "timestamp": _now_iso(),
        "source": "transcript-watcher",
    })


def main():
    """Read hook input, classify recent watcher events, update state."""
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError, ValueError):
        return 0
    sid = data.get("session_id") or "unknown"
    events_file = EVENTS_DIR / f"{sid}.jsonl"
    events = read_events(events_file)
    if not events:
        return 0
    seen = categories_seen(events)
    if not seen:
        return 0
    state = load_session_state(sid)
    existing_types = {a.get("type") for a in state.get("agents", []) if isinstance(a, dict)}
    added = False
    for cat in seen:
        if cat not in existing_types:
            _ensure_agent(state, cat)
            added = True
    if added:
        try:
            save_session_state(sid, state)
        except (OSError, ValueError):
            pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
