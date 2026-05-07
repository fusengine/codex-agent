"""Background watch loop and POSIX double-fork daemonization."""

import json
import os
import time

from .transcript_events import extract_event

MAX_SESSION_SECONDS = 28800
POLL_INTERVAL = 1.0


def _append_event(events_file, event):
    """Append one normalized event as JSON line to events_file."""
    try:
        with open(events_file, "a", encoding="utf-8") as ef:
            ef.write(json.dumps(event) + "\n")
    except OSError:
        pass


def watch_loop(transcript_path, events_file):
    """Tail rollout JSONL and append matching tool-call events."""
    events_file.parent.mkdir(parents=True, exist_ok=True)
    last_offset = 0
    deadline = time.time() + MAX_SESSION_SECONDS
    while time.time() < deadline:
        if not transcript_path.is_file():
            time.sleep(POLL_INTERVAL * 2)
            continue
        try:
            with open(transcript_path, encoding="utf-8") as f:
                f.seek(last_offset)
                new_data = f.read()
                last_offset = f.tell()
        except OSError:
            time.sleep(POLL_INTERVAL * 2)
            continue
        for line in new_data.splitlines():
            event = extract_event(line)
            if event is not None:
                _append_event(events_file, event)
        time.sleep(POLL_INTERVAL)


def detach_and_watch(transcript_path, events_file):
    """Daemonize via POSIX double-fork then enter the watch loop."""
    if os.fork() != 0:
        os._exit(0)
    os.setsid()
    if os.fork() != 0:
        os._exit(0)
    devnull = os.open(os.devnull, os.O_RDWR)
    for fd in (0, 1, 2):
        os.dup2(devnull, fd)
    watch_loop(transcript_path, events_file)
