#!/usr/bin/env python3
"""UserPromptSubmit hook: verify AGENTS.md without printing full context."""

import json
import os
import sys
from datetime import datetime

CODEX_HOME = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))
LOG_DIR = os.path.join(CODEX_HOME, "fusengine-cache", "logs")
LOG_FILE = os.path.join(LOG_DIR, "hooks.log")


def log(msg):
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{ts}] [UserPromptSubmit/read-codex-md] {msg}\n")
    except OSError:
        pass


def main():
    try:
        json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)
    codex_md = os.path.join(CODEX_HOME, "AGENTS.md")
    if not os.path.isfile(codex_md):
        log("ERROR: AGENTS.md not found")
        sys.exit(0)
    try:
        with open(codex_md, encoding="utf-8") as f:
            line_count = sum(1 for _ in f)
    except OSError:
        sys.exit(0)
    # Keep terminal quiet; Codex displays stdout/stderr in hook panels.
    log(f"AGENTS.md available ({line_count} lines)")
    sys.exit(0)


if __name__ == "__main__":
    main()
