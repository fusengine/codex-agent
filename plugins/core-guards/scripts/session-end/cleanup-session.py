#!/usr/bin/env python3
"""SessionEnd hook: Clean temp files on session end."""
import glob
import os
import sys
import time

CODEX_HOME = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))

def main():
    tracking_dir = os.path.join(CODEX_HOME, 'fusengine-cache', 'session-tmp')
    if os.path.isdir(tracking_dir):
        now = time.time()
        for f in glob.glob(os.path.join(tracking_dir, '*.tmp')):
            try:
                if now - os.path.getmtime(f) > 3600:
                    os.remove(f)
            except OSError:
                pass

    now = time.time()
    cache_base = os.path.join(CODEX_HOME, 'fusengine-cache')
    for pattern in ['codex_solid_reads_*', 'codex_session_changes_*']:
        for f in glob.glob(os.path.join(cache_base, pattern)):
            try:
                if now - os.path.getmtime(f) > 7200:
                    os.remove(f)
            except OSError:
                pass

    sys.exit(0)


if __name__ == '__main__':
    main()
