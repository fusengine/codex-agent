#!/usr/bin/env python3
"""PreToolUse hook: block Write/Edit/apply_patch on files matching .codexignore.

Loads .codexignore from the project cwd (or any ancestor up to repo root)
and uses gitignore-style fnmatch patterns to deny tool calls on protected
files (e.g., .env, secrets, credentials, .git/).
"""

import fnmatch
import json
import os
import sys
from pathlib import Path


def _find_codexignore(start):
    """Walk up from start until a .codexignore file is found or filesystem root."""
    current = Path(start).resolve()
    for candidate in [current, *current.parents]:
        target = candidate / ".codexignore"
        if target.is_file():
            return target, candidate
    return None, None


def _load_patterns(path):
    """Read .codexignore and return list of non-comment, non-empty patterns."""
    try:
        with open(path, encoding="utf-8") as f:
            return [
                line.strip() for line in f
                if line.strip() and not line.strip().startswith("#")
            ]
    except OSError:
        return []


def _matches(rel_path, patterns):
    """Return True if rel_path matches any gitignore-style pattern."""
    rel_str = rel_path.replace(os.sep, "/")
    parts = rel_str.split("/")
    for pattern in patterns:
        if fnmatch.fnmatch(rel_str, pattern):
            return pattern
        if fnmatch.fnmatch(rel_str, f"*/{pattern}"):
            return pattern
        for part in parts:
            if fnmatch.fnmatch(part, pattern):
                return pattern
    return None


def _emit_deny(file_path, pattern, ignore_path):
    """Print Codex hook deny payload and exit 2."""
    reason = (
        f"BLOCKED: {file_path} matches .codexignore pattern '{pattern}' "
        f"(rules at {ignore_path}). Edit .codexignore to allow."
    )
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def main():
    """Entry: parse hook input, check file_path against .codexignore."""
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError, ValueError):
        sys.exit(0)
    fp = data.get("tool_input", {}).get("file_path", "")
    cwd = data.get("cwd") or os.getcwd()
    if not fp:
        sys.exit(0)
    ignore_file, ignore_root = _find_codexignore(cwd)
    if not ignore_file:
        sys.exit(0)
    patterns = _load_patterns(ignore_file)
    if not patterns:
        sys.exit(0)
    try:
        rel = os.path.relpath(fp, ignore_root)
    except ValueError:
        rel = fp
    matched = _matches(rel, patterns)
    if matched:
        _emit_deny(fp, matched, ignore_file)
    sys.exit(0)


if __name__ == "__main__":
    main()
