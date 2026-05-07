#!/usr/bin/env python3
"""inject-rules.py - Verify rules/*.md without printing hook context.

Receives plugin root as first CLI argument.
"""

import glob
import os
import sys


def main() -> None:
    """Main entry for quiet SessionStart/UserPromptSubmit rules check."""
    if len(sys.argv) < 2:
        sys.exit(1)

    plugin_root = sys.argv[1]
    rules_dir = os.path.join(plugin_root, "rules")

    if not os.path.isdir(rules_dir):
        sys.exit(0)

    rules = sorted(glob.glob(os.path.join(rules_dir, "*.md")))
    if not rules:
        sys.exit(0)

    # Keep terminal quiet; AGENTS.md carries the rule pointers.
    sys.exit(0)


if __name__ == "__main__":
    main()
