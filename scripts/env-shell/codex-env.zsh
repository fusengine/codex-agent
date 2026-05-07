#!/bin/zsh
# Codex - Load API keys from CODEX_HOME/.env
# Add to ~/.zshrc: source /path/to/codex-env.zsh

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
if [[ -f "$CODEX_HOME/.env" ]]; then
    source "$CODEX_HOME/.env"
fi
