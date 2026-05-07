#!/bin/bash
# Codex - Load API keys from CODEX_HOME/.env
# Add to ~/.bashrc: source /path/to/codex-env.bash

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
if [ -f "$CODEX_HOME/.env" ]; then
    source "$CODEX_HOME/.env"
fi
