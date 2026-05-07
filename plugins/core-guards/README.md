# Core Guards

Security guards and SOLID enforcement hooks for Codex.

## Features

### PreToolUse Guards

| Guard | Matcher | Description |
|-------|---------|-------------|
| **bash-write-guard** | Bash | Bloque les écritures via shell (`python -c`, `sed -i`, redirections) — force Edit/Write |
| **git-guard** | Bash | Bloque les git destructifs (`push --force`, `reset --hard`) — confirme les autres |
| **install-guard** | Bash | Confirme avant installation de paquets (npm, pip, brew, etc.) |
| **security-guard** | Bash | Valide les commandes dangereuses via règles sécurité |
| **pre-commit-guard** | Bash | ESLint, TypeScript, Prettier, Ruff avant `git commit` |
| **codexignore-guard** | Write\|Edit | Bloque les writes matchant `.codexignore` (gitignore-style) — protège `.env`, `secrets/`, `*.key`, etc. |
| **enforce-interfaces** | Write\|Edit | Bloque interfaces/types dans `.tsx`/`.jsx`/`.vue` — doivent être dans `src/interfaces/` |
| **enforce-file-size** | Write\|Edit | Bloque l'édition de fichiers > 100 lignes — split obligatoire |
| **require-solid-read** | Write\|Edit | Force la lecture des règles SOLID avant modif code |
| **require-apex-agents** | Write\|Edit | Force le lancement d'agents APEX (explore/research/domain) avant édition |

### PostToolUse Guards

| Guard | Matcher | Description |
|-------|---------|-------------|
| **enforce-file-size** | Write\|Edit | Bloque fichiers > 100 lignes — doit être splitté |
| **track-session-changes** | Write\|Edit | Tracking changements cumulés pour déclenchement sniper |
| **post-edit-typescript** | Write\|Edit | Validation TypeScript post-édition |
| **track-subagent-research** | Bash, mcp__context7\|exa | Enregistre les calls MCP/exploration des sub-agents pour conformité APEX |
| **sync-transcript-to-session** | Bash, apply_patch, Write\|Edit | Lit le buffer transcript-events et sync vers session-state — capte les outils natifs Codex non-hookables (`read_file`, `web_search`, `spawn_agent`) |
| **cache-mcp-result** | mcp__context7\|exa | Cache les résultats MCP dans `context/mcp/` pour réutilisation cross sub-agents |

### SessionStart

| Script | Description |
|--------|-------------|
| **inject-codex-md** | Injecte AGENTS.md dans le contexte de session |
| **load-dev-context** | Charge git status, détecte le type de projet |
| **cleanup-session-states** | Nettoie les fichiers session-state stale de `/tmp` |
| **transcript-watcher** | Spawn un watcher background (double-fork POSIX) qui tail le rollout JSONL pour capter les outils natifs Codex non-hookables (`read_file`, `web_search`, `spawn_agent`) |

### UserPromptSubmit

| Script | Description |
|--------|-------------|
| **read-codex-md** | Reads AGENTS.md + auto-triggers APEX for dev tasks |

### Stop (cross-platform TTS)

| Event | Script | Description |
|-------|--------|-------------|
| **Task complete** | `notify-completion.py` | TTS cross-plateforme : `afplay` (macOS), `paplay`/`aplay`/`mpv`/`ffplay` (Linux), `SoundPlayer` (Windows). Joue `song/finish.mp3`, fallback silencieux si aucun player. |

### PermissionRequest

| Matcher | Sound | Description |
|---------|-------|-------------|
| (any) | `permission-need.mp3` | Toutes les demandes de permission (système + déclenchées par hooks) |

> **Note Codex :** les events `Notification`, `SubagentStart`, `SubagentStop`, `PreCompact`, `SessionEnd` ne sont pas supportés par Codex CLI 0.128 — archivés dans `codex-unsupported-hooks.json` pour traçabilité.

### Statusline

Modular SOLID statusline for Codex terminal.

| Segment | Description |
|---------|-------------|
| **codex** | Codex version |
| **directory** | Path + git (branch, dirty, staged/unstaged) |
| **model** | Model name + tokens |
| **context** | Context usage progress bar |
| **cost** | Session cost |
| **limits** | 5h/7d limits with reset time |
| **dailySpend** | Daily spending |
| **node** | Node.js version |
| **edits** | Edit counter |

## Installation

### 1. Install Plugin

```bash
/plugin install core-guards
```

### 2. Install Hooks + Statusline

```bash
~/.codex/plugins/marketplaces/fusengine-plugins/setup.sh
```

This script will:
- Install Codex hooks in `~/.codex/hooks.json`
- Enable `features.codex_hooks` in `~/.codex/config.toml`
- Install statusline bun dependencies
- Configure `[tui].status_line` in `~/.codex/config.toml`

### 3. Configure Statusline Options

Codex currently exposes the terminal footer through built-in `status_line`
segments in `~/.codex/config.toml`. The installer writes:

```toml
[tui]
status_line = [
  "codex-version",
  "model-with-reasoning",
  "project-name",
  "context-used",
  "context-remaining",
  "five-hour-limit",
  "weekly-limit",
]
```

The installer keeps the status line compact because Codex renders built-in
segments verbosely. The historical custom renderer is kept in `statusline/` as
a portable Bun utility, but Codex currently uses built-in status line segments
for the TUI footer.

```bash
bun run config        # Web configurator
bun run config:term   # Terminal configurator
```

## Configuration

Les guards sont chargés automatiquement par le système de hooks. Aucune configuration additionnelle requise.

### `.codexignore`

Créer un `.codexignore` à la racine du projet pour bloquer les writes/edits sur des fichiers sensibles. Syntaxe gitignore-style :

```
.env
.env.*
secrets/
*.key
credentials.json
```

Le guard `codexignore-guard.py` remonte l'arbre depuis `cwd` jusqu'à trouver un `.codexignore`, puis applique les patterns via `fnmatch`.

### Ralph Mode

Git and install guards support **Ralph Mode** for autonomous development:
- Set `RALPH_MODE=1` environment variable
- Or create `.codex/ralph/prd.json` in project
- Or work on a `feature/*` branch

In Ralph mode, safe git commands and project-level installs are auto-approved.

## License

MIT
