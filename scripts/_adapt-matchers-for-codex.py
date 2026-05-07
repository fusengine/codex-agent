#!/usr/bin/env python3
"""Adapt hooks.json matchers for Codex CLI tool-name support.

Codex CLI exposes only: Bash, apply_patch (aliases Edit/Write), MCP tool names.
Tools NOT exposed: Read, Agent, Task*, Glob, Grep, WebSearch, WebFetch, TodoWrite.

Strategy:
- Filter each matcher's tokens (split on `|`).
- Drop unsupported tokens.
- If matcher becomes empty -> move whole hook entry to codex-unsupported-hooks.json.
- Otherwise rewrite matcher with remaining tokens.
"""

import json
import re
from pathlib import Path

PLUGINS_ROOT = Path(__file__).resolve().parent.parent / "plugins"

CODEX_TOOLS = {"Bash", "apply_patch", "Write", "Edit"}
MCP_RE = re.compile(r"^mcp__")


def is_supported(token: str) -> bool:
    """Return True if a single matcher token is supported by Codex CLI."""
    token = token.strip()
    if token in ("", "*"):
        return True
    if token in CODEX_TOOLS:
        return True
    if MCP_RE.match(token):
        return True
    return False


def filter_matcher(matcher: str) -> "str | None":
    """Return new matcher string (or None if all tokens dropped)."""
    if not matcher or matcher == "*":
        return matcher
    tokens = [t.strip() for t in matcher.split("|") if t.strip()]
    kept = [t for t in tokens if is_supported(t)]
    if not kept:
        return None
    return "|".join(kept)


def load_json(path: Path) -> dict:
    """Load JSON file or return default unsupported scaffold."""
    if not path.is_file():
        return {
            "description": "Original hook events without a direct Codex hook equivalent.",
            "hooks": {},
        }
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {
            "description": "Original hook events without a direct Codex hook equivalent.",
            "hooks": {},
        }


def write_json(path: Path, data: dict) -> None:
    """Write JSON pretty."""
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def process_plugin(plugin_dir: Path) -> tuple[int, int, int]:
    """Adapt one plugin. Return (kept, rewritten, archived) counts."""
    hooks_file = plugin_dir / "hooks.json"
    if not hooks_file.is_file():
        return (0, 0, 0)

    unsupported_file = plugin_dir / "codex-unsupported-hooks.json"
    data = load_json(hooks_file)
    unsupported = load_json(unsupported_file)
    unsupported_hooks = unsupported.setdefault("hooks", {})

    kept = rewritten = archived = 0
    hooks = data.get("hooks", {})

    for event, entries in list(hooks.items()):
        new_entries = []
        for entry in entries:
            matcher = entry.get("matcher", "")
            new_matcher = filter_matcher(matcher)
            if new_matcher is None:
                unsupported_hooks.setdefault(event, []).append(entry)
                archived += 1
            elif new_matcher != matcher:
                entry["matcher"] = new_matcher
                new_entries.append(entry)
                rewritten += 1
            else:
                new_entries.append(entry)
                kept += 1
        if new_entries:
            hooks[event] = new_entries
        else:
            hooks.pop(event, None)

    write_json(hooks_file, data)
    if archived:
        write_json(unsupported_file, unsupported)
    return (kept, rewritten, archived)


def main() -> int:
    """Walk all source plugins and adapt their hooks."""
    if not PLUGINS_ROOT.is_dir():
        print(f"Plugins dir not found: {PLUGINS_ROOT}")
        return 1

    total_kept = total_rewritten = total_archived = 0
    for plugin_dir in sorted(PLUGINS_ROOT.iterdir()):
        if not plugin_dir.is_dir():
            continue
        k, r, a = process_plugin(plugin_dir)
        if r or a:
            print(f"  {plugin_dir.name}: kept={k} rewritten={r} archived={a}")
        total_kept += k
        total_rewritten += r
        total_archived += a

    print(
        f"Done: kept={total_kept} rewritten={total_rewritten} "
        f"archived={total_archived}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
