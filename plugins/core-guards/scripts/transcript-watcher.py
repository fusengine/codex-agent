#!/usr/bin/env python3
"""SessionStart hook: spawn background watcher tailing the rollout JSONL.

Codex CLI exposes only Bash/apply_patch/MCP as hookable tools. Other native
tools (read_file, web_search, spawn_agent, exec_command, imagegen) are NOT
hookable but their calls are written to the rollout JSONL transcript.

This script detaches a background process (double-fork) that tails the
transcript and appends normalized tool-call events to a session events file
readable by other plugin hooks.
"""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.transcript_watch import detach_and_watch  # noqa: E402

CODEX_HOME = Path(os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex")))
EVENTS_DIR = CODEX_HOME / "fusengine-cache" / "transcript-events"


def main():
    """Parse SessionStart hook input from stdin, detach watcher in background."""
    try:
        hook_input = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError, ValueError):
        return 0
    transcript_path = hook_input.get("transcript_path")
    session_id = hook_input.get("session_id", "unknown")
    if not transcript_path:
        return 0
    events_file = EVENTS_DIR / f"{session_id}.jsonl"
    detach_and_watch(Path(transcript_path), events_file)
    return 0


if __name__ == "__main__":
    sys.exit(main())
