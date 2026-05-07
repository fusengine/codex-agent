#!/usr/bin/env python3
"""SessionStart hook: verify AGENTS.md without printing full context."""
import os
import sys
from datetime import datetime

CODEX_HOME = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))
LOG_DIR = os.path.join(CODEX_HOME, "fusengine-cache", "logs")
LOG_FILE = os.path.join(LOG_DIR, 'hooks.log')


def log(msg):
    """Log with timestamp."""
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f'[{ts}] [SessionStart/inject-codex-md] {msg}\n')
    except OSError:
        pass


def main():
    codex_md = os.path.join(CODEX_HOME, 'AGENTS.md')
    if not os.path.isfile(codex_md):
        log(f'ERROR: AGENTS.md not found at {codex_md}')
        sys.exit(0)

    try:
        with open(codex_md, encoding='utf-8') as f:
            content = f.read()
    except OSError:
        log('ERROR: Cannot read AGENTS.md')
        sys.exit(0)

    lines = content.count('\n') + 1
    # Keep terminal quiet; Codex displays additionalContext as hook context.
    log(f'AGENTS.md available ({lines} lines)')
    sys.exit(0)


if __name__ == '__main__':
    main()
