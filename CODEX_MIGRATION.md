# Codex Migration

État courant de la migration des plugins vers Codex CLI 0.128+.

## Ce qui est natif Codex

Codex CLI 0.128 supporte officiellement ces hook events :

- `PreToolUse`, `PostToolUse`
- `SessionStart`, `UserPromptSubmit`
- `Stop`, `PermissionRequest`

Matchers reconnus par Codex (whitelist stricte) :

- `Bash` — exécution shell
- `apply_patch` — alias accepté pour `Write` / `Edit` (les hooks utilisent `Write|Edit`, l'installer réécrit si nécessaire)
- `mcp__<server>__<tool>` — appels MCP

Tout autre matcher (`Read`, `web_search`, `spawn_agent`, `Task`, etc.) est **silencieusement ignoré** par Codex.

## Outils natifs non-hookables

Codex émet plusieurs appels que les hooks ne peuvent pas intercepter directement :

- `read_file`, `view_image`
- `web_search`, `imagegen`
- `spawn_agent`, `apply_patch` (en mode interne)
- `tool_search_call`, `function_call` génériques

**Solution implémentée :** un `transcript-watcher.py` lancé au `SessionStart` (double-fork POSIX) tail le rollout JSONL (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`) et capture ces événements. Un hook `PostToolUse` (`sync-transcript-to-session.py`) lit le buffer, classifie les events (explore/research) et les pousse dans le session-state utilisé par les guards APEX.

Modules :

- `plugins/core-guards/scripts/transcript-watcher.py` — entrypoint SessionStart
- `plugins/core-guards/scripts/lib/transcript_watch.py` — boucle de polling + détachement
- `plugins/core-guards/scripts/lib/transcript_events.py` — extraction d'events normalisés
- `plugins/core-guards/scripts/lib/transcript_classifier.py` — classification explore vs research
- `plugins/core-guards/scripts/post-tool-use/sync-transcript-to-session.py` — sync vers session-state

## Hooks installés

L'installer (`setup.sh` / `setup.ps1`) :

1. Copie chaque plugin dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/`
2. Mirror `plugins/_shared/` vers `~/.codex/plugins/cache/fusengine-plugins/<plugin>/_shared/` (résolu via `..` x3 depuis `scripts/`)
3. Réécrit les chemins relatifs `./scripts/...` en absolus dans `hooks.json`
4. Active `[features] codex_hooks = true` et `[features] plugin_hooks = true` dans `~/.codex/config.toml`

## Feature flags Codex

L'installer écrit ces flags non-interactifs (defaults) :

```toml
[features]
codex_hooks = true
plugin_hooks = true
memories = true
undo = true
chronicle = true
goals = true
enable_fanout = true
steer = true
tool_search = true
child_agents_md = true
```

Et propose 8 prompts interactifs via `@clack/prompts` :

- `memories` — knowledge persistente
- `undo` — undo session
- `apps` — apps tierces
- `approval_policy` — politique d'approbation
- `sandbox_mode` — mode sandbox
- `web_search` — recherche web native
- `personality` — ton de réponse
- `model_reasoning_effort` — effort de raisonnement

Modules :

- `scripts/src/services/codex-features-defaults.ts`
- `scripts/src/services/codex-features-prompts.ts`
- `scripts/src/services/codex-features-toml.ts`
- `scripts/src/services/codex-features.ts`

## Sprint 1 — guards récents

| Guard | Type | Description |
|-------|------|-------------|
| `codexignore-guard.py` | PreToolUse `Write\|Edit` | Bloque les writes sur paths matchant `.codexignore` (gitignore-style) |
| `notify-completion.py` | Stop | TTS cross-platform : `afplay` (macOS), `paplay`/`aplay`/`mpv`/`ffplay` (Linux), `SoundPlayer` (Windows) |
| `transcript-watcher.py` | SessionStart | Capture des outils natifs non-hookables via tail du rollout JSONL |

`.codexignore` supporte les patterns gitignore-style :

```
.env
.env.*
secrets/
*.key
credentials.json
```

## Hook events archivés (non-supportés Codex)

`plugins/<plugin>/codex-unsupported-hooks.json` conserve les hook events qui n'ont pas d'équivalent direct Codex :

- `SessionEnd`, `SubagentStart`, `SubagentStop`
- `Notification`, `PreCompact`, `PostToolUseFailure`
- `TaskCompleted`, `TeammateIdle`, `InstructionsLoaded`
- Stop blocks `"type": "prompt"` (Claude Code only)

Conservés pour traçabilité et future compatibilité.

## Vérification

```bash
cd scripts
bun run verify:codex
```

Ou test ciblé d'un guard :

```bash
echo '{"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":"/tmp/test/.env"},"cwd":"/tmp/test"}' \
  | python3 plugins/core-guards/scripts/pre-tool-use/codexignore-guard.py
```
