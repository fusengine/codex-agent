#!/bin/bash
# Fusengine Plugins - Quick Setup
set -euo pipefail

SOURCE_ROOT="$(cd "$(dirname "$0")" && pwd)"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex}"
TARGET_ROOT="${CODEX_HOME}/plugins/marketplaces/fusengine-plugins"

if [[ "$SOURCE_ROOT" != "$TARGET_ROOT" ]]; then
	mkdir -p "$(dirname "$TARGET_ROOT")"
	if command -v rsync >/dev/null 2>&1; then
		rsync -a --delete \
			--exclude ".git" \
			--exclude "fusengine-hooks.log" \
			--exclude "methodology-state.json" \
			--exclude "scripts/node_modules" \
			"$SOURCE_ROOT/" "$TARGET_ROOT/"
	else
		rm -rf "$TARGET_ROOT"
		mkdir -p "$TARGET_ROOT"
		cp -R "$SOURCE_ROOT/." "$TARGET_ROOT/"
		rm -rf "$TARGET_ROOT/.git" "$TARGET_ROOT/scripts/node_modules"
	fi
fi

(cd "$TARGET_ROOT/scripts" && bun install && bun install-hooks.ts "$@")
