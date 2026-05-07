#!/usr/bin/env python3
"""Rewrite cache hooks.json files to use absolute script paths.

Codex CLI loads ~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/hooks.json
and resolves `./scripts/...` against the user's cwd, not the plugin dir.
This script rewrites those relative paths to absolute paths so commands
work from any cwd.
"""

import json
import re
import sys
from pathlib import Path

CACHE_ROOT = Path.home() / ".codex" / "plugins" / "cache" / "fusengine-plugins"
RELATIVE_RE = re.compile(r"(^|\s)(\.\/[^\s'\"|;&]+)")


def rewrite_command(command: str, plugin_root: Path) -> str:
    """Replace `./...` paths with absolute paths inside plugin_root."""
    def replace(match: re.Match) -> str:
        prefix, rel = match.group(1), match.group(2)
        absolute = plugin_root / rel[2:]
        return f"{prefix}{absolute}"

    return RELATIVE_RE.sub(replace, command)


def process_hooks_file(hooks_file: Path, plugin_root: Path) -> int:
    """Rewrite one hooks.json. Return number of commands rewritten."""
    try:
        data = json.loads(hooks_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return 0

    rewritten = 0
    hooks = data.get("hooks", {})
    for event_entries in hooks.values():
        for entry in event_entries:
            for hook in entry.get("hooks", []):
                cmd = hook.get("command", "")
                if not cmd:
                    continue
                new_cmd = rewrite_command(cmd, plugin_root)
                if new_cmd != cmd:
                    hook["command"] = new_cmd
                    rewritten += 1

    if rewritten:
        hooks_file.write_text(
            json.dumps(data, indent=2) + "\n", encoding="utf-8"
        )
    return rewritten


def main() -> int:
    """Walk cache plugins and rewrite each hooks.json."""
    if not CACHE_ROOT.is_dir():
        print(f"Cache root not found: {CACHE_ROOT}", file=sys.stderr)
        return 1

    total_files = 0
    total_rewrites = 0
    for plugin_dir in sorted(CACHE_ROOT.iterdir()):
        if not plugin_dir.is_dir():
            continue
        local = plugin_dir / "local"
        hooks_file = local / "hooks.json"
        if not hooks_file.is_file():
            continue
        rewrites = process_hooks_file(hooks_file, local)
        if rewrites:
            total_files += 1
            total_rewrites += rewrites
            print(f"  {plugin_dir.name}: {rewrites} command(s) rewritten")

    print(
        f"Done: {total_rewrites} command(s) rewritten across "
        f"{total_files} hooks.json file(s)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
