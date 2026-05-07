"""Classify Codex transcript events into APEX agent quality buckets.

Codex CLI does not expose `Agent` tool calls; the model uses native tools
(read_file, exec_command, web_search) directly. We classify these into the
two APEX agent buckets that PreToolUse Write|Edit guards expect:
- explore-codebase: file/code exploration via shell or read_file
- research-expert: documentation/web research via web_search or MCP docs
"""

import json
import re
from pathlib import Path

EXPLORE_SHELL_RE = re.compile(
    r"\b(grep|rg|find|ls|cat|head|tail|sed|awk|tree|fd|wc)\b"
)
EXPLORE_NAMES = {"read_file", "tool_search", "_search"}
RESEARCH_NAMES = {"web_search"}
RESEARCH_MCP_RE = re.compile(r"^mcp__(context7|exa|astro-docs|apple-docs)")


def _classify(event):
    """Return 'explore-codebase', 'research-expert' or None."""
    name = event.get("name", "")
    if name in EXPLORE_NAMES:
        return "explore-codebase"
    if name in RESEARCH_NAMES:
        return "research-expert"
    if RESEARCH_MCP_RE.match(name):
        return "research-expert"
    if name in {"exec_command", "shell_command"}:
        args = event.get("arguments") or ""
        if isinstance(args, dict):
            args = json.dumps(args)
        if EXPLORE_SHELL_RE.search(args):
            return "explore-codebase"
    return None


def read_events(events_file):
    """Read all events from a JSONL events file. Return list of dicts."""
    events = []
    if not Path(events_file).is_file():
        return events
    try:
        with open(events_file, encoding="utf-8") as f:
            for line in f:
                try:
                    events.append(json.loads(line))
                except (json.JSONDecodeError, ValueError):
                    continue
    except OSError:
        pass
    return events


def categories_seen(events):
    """Return set of APEX categories detected across events list."""
    seen = set()
    for event in events:
        cat = _classify(event)
        if cat:
            seen.add(cat)
    return seen
