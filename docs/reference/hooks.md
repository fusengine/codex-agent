# Hooks System

Automatic enforcement of APEX methodology and SOLID principles through Codex hooks.

## Overview

The hooks system ensures that agents:
1. **Consult skills** before writing code
2. **Follow APEX methodology** (Analyze → Plan → Execute → eXamine)
3. **Respect SOLID principles** (files < 100 lines, interfaces separated)

## Architecture

### Codex CLI 0.128+ (natif)

```
$CODEX_HOME/config.toml                 ← [features] codex_hooks=true, plugin_hooks=true
       │
       ▼
$CODEX_HOME/plugins/cache/fusengine-plugins/<plugin>/local/hooks.json
       │                                ← chemins absolus réécrits par l'installer
       ▼
python3 ./scripts/<event>/<guard>.py    ← exécuté directement par Codex
```

### Claude Code (legacy, conservé pour compat)

```
$CLAUDE_HOME/settings.json
       │
       ▼
scripts/hooks-loader.ts                 ← Bun + SOLID, exécution parallèle
       │
       ▼
plugins/*/hooks/hooks.json
```

## Installation

### macOS / Linux
```bash
$CODEX_HOME/plugins/marketplaces/fusengine-plugins/setup.sh
```

### Windows (PowerShell)
```powershell
~\.codex\plugins\marketplaces\fusengine-plugins\setup.ps1
```

L'installer écrit :
- **`hooks.json`** par plugin dans `$CODEX_HOME/plugins/cache/fusengine-plugins/<plugin>/local/` (chemins absolus)
- **`_shared/`** mirroré dans `$CODEX_HOME/plugins/cache/fusengine-plugins/<plugin>/_shared/`
- **`[features] codex_hooks=true, plugin_hooks=true`** + 8 feature flags Codex (memories, undo, chronicle, goals, enable_fanout, steer, tool_search, child_agents_md) dans `$CODEX_HOME/config.toml`
- **API keys** (prompts interactifs)
- **Shell config** (bash/zsh/fish/PowerShell)
- **MCP servers** (sélection interactive)
- **Statusline** TUI Codex

All plugin hooks are automatically detected and loaded.

## Hook Types (Codex CLI 0.128+)

| Hook | Trigger | Purpose |
|------|---------|---------|
| **SessionStart** | Session starts | Load context, inject AGENTS.md, cleanup states, spawn transcript-watcher |
| **UserPromptSubmit** | User sends message | Detect project type, inject APEX instruction |
| **PreToolUse** | Before Bash/apply_patch (Write\|Edit) | Block secrets (.codexignore), validate git/install, enforce APEX/SOLID phases |
| **PostToolUse** | After Bash/apply_patch/MCP | Validate SOLID, track changes, cache MCP results, sync transcript events |
| **Stop** | Codex finishes responding | Cross-platform TTS completion sound |
| **PermissionRequest** | Permission dialog shown | Play sound for permission prompts |

### Codex hook matchers — whitelist stricte

Codex 0.128 ne reconnaît **que** ces matchers :
- `Bash`
- `apply_patch` (alias pour `Write` / `Edit`)
- `mcp__<server>__<tool>`

Tout autre matcher (`Read`, `web_search`, `spawn_agent`, `Task`, `Notification`, `SubagentStart`, etc.) est silencieusement ignoré.

### Outils natifs non-hookables — solution transcript-watcher

Codex émet plusieurs appels que les hooks ne peuvent pas intercepter directement : `read_file`, `view_image`, `web_search`, `imagegen`, `spawn_agent`, `tool_search_call`.

**Solution** : un watcher background (`plugins/core-guards/scripts/transcript-watcher.py`) lancé au `SessionStart` via double-fork POSIX. Il tail le rollout JSONL (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`), extrait les events normalisés (`function_call`, `tool_search_call`, `web_search_call`), les classifie (explore vs research) et les expose via un buffer lu par `sync-transcript-to-session.py` (PostToolUse) qui les pousse dans le session-state APEX.

```
SessionStart → transcript-watcher.py (background, double-fork)
                ↓
          tail ~/.codex/sessions/.../rollout-*.jsonl
                ↓
          extract events → classify → buffer

PostToolUse (Bash|apply_patch) → sync-transcript-to-session.py
                ↓
          read buffer → upsert into session-state.json
                ↓
          consumed by require-apex-agents.py guard
```

### Hook events archivés (non supportés Codex)

Conservés dans `plugins/<plugin>/codex-unsupported-hooks.json` pour traçabilité et future compatibilité :

- `SessionEnd`, `SubagentStart`, `SubagentStop`
- `Notification`, `PreCompact`, `PostToolUseFailure`
- `TaskCompleted`, `TeammateIdle`, `InstructionsLoaded`
- Stop blocks `"type": "prompt"` (Claude Code only)

## Plugins with Hooks

| Plugin | PreToolUse | PostToolUse | UserPromptSubmit | SessionStart | SubagentStart | SubagentStop | Stop | Notification | PreCompact | SessionEnd | Setup |
|--------|------------|-------------|------------------|--------------|---------------|--------------|------|--------------|------------|------------|-------|
| **ai-pilot** | APEX phases, APEX context | SOLID check, Doc tracking, Task sync | APEX injection | - | Context inject, Explore cache, Doc cache inject, Lessons inject, Test cache inject | Sniper lessons, Test results, Doc from transcript, SOLID from transcript | - | - | - | Analytics save | - |
| **core-guards** | Git, Install, Security, Pre-commit, Interfaces, File size, SOLID read | File size, Session tracking, Doc reads, SOLID reads, TS validation | AGENTS.md injection | Context, Cleanup | - | Memory | Sound | Sounds | APEX state | Cleanup, Stats | API keys |
| **react-expert** | Block without skill | React SOLID validation | - | - | - | - | - | - | - | - | - |
| **nextjs-expert** | Block without skill | Next.js SOLID validation | - | - | - | - | - | - | - | - | - |
| **laravel-expert** | Block without skill | Laravel SOLID validation | - | - | - | - | - | - | - | - | - |
| **swift-apple-expert** | Block without skill | Swift SOLID validation | - | - | - | - | - | - | - | - | - |
| **tailwindcss** | Block without skill | Tailwind best practices | - | - | - | - | - | - | - | - | - |
| **design-expert** | Block without skill | Accessibility check | - | - | - | - | - | - | - | - | - |

## Loader Architecture (v2.0 - Bun + SOLID — Claude legacy)

> Sous Codex CLI 0.128+, le loader Bun n'est **pas** utilisé : Codex exécute directement les hooks listés dans `$CODEX_HOME/plugins/cache/fusengine-plugins/<plugin>/local/hooks.json`. La structure ci-dessous concerne uniquement Claude Code.

```
scripts/
├── hooks-loader.ts            ← Entry point
├── install-hooks.ts           ← Installation + API keys
├── package.json
├── src/
│   ├── interfaces/
│   │   ├── hooks.ts           ← Hook interfaces
│   │   └── env.ts             ← EnvKey interface
│   ├── config/
│   │   └── api-keys.ts        ← API keys configuration
│   ├── services/
│   │   ├── plugin-scanner.ts  ← Scan plugins, extract hooks
│   │   ├── hook-executor.ts   ← Execute hooks in PARALLEL
│   │   ├── settings-manager.ts← Manage settings.json
│   │   └── env-manager.ts     ← API keys & shell config
│   └── __tests__/
│       ├── api-keys.test.ts
│       ├── env-manager.test.ts
│       ├── fs-helpers.test.ts
│       ├── hook-executor.test.ts
│       ├── install-hooks.test.ts
│       ├── plugin-scanner.test.ts
│       └── settings-manager.test.ts
└── env-shell/
    ├── codex-env.bash
    ├── codex-env.zsh
    ├── codex-env.fish
    └── codex-env.ps1
```

### Testing

```bash
bun test           # Run 81 tests
bun test --watch   # Watch mode
```

### Performance

| Version | Execution | Speed |
|---------|-----------|-------|
| v1.0 (bash+jq) | Sequential | 280ms |
| **v2.0 (Bun)** | **Parallel** | **100ms** |

## Adding Hooks to a New Plugin

1. Create the hooks directory:
```bash
mkdir -p plugins/my-plugin/hooks plugins/my-plugin/scripts
```

2. Create `hooks/hooks.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash ./scripts/my-check.sh"
          }
        ]
      }
    ]
  }
}
```

3. Create your script in `scripts/my-check.sh`

4. Make it executable:
```bash
chmod +x plugins/my-plugin/scripts/*.sh
```

The hooks loader will automatically detect and load your new hooks.

## Script Input Format (Codex)

Les hooks reçoivent un JSON via stdin :

```json
{
  "hook_event_name": "PreToolUse",
  "session_id": "...",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.tsx",
    "content": "..."
  },
  "cwd": "/path/to/project"
}
```

## Script Output (Codex)

### Autoriser

```bash
exit 0
```

### Bloquer (Codex hookSpecificOutput)

```python
print(json.dumps({"hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "raison du blocage"
}}))
sys.exit(0)
```

### Injecter du contexte

```python
print(json.dumps({"hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "contexte à injecter"
}}))
sys.exit(0)
```

> **Note** : Codex n'utilise pas `exit 2` ni stderr — il faut utiliser `hookSpecificOutput.permissionDecision` pour bloquer/autoriser.

## Troubleshooting

### Hooks not loading
```bash
# Vérifier que les hooks plugin sont en place avec chemins absolus
ls $CODEX_HOME/plugins/cache/fusengine-plugins/*/local/hooks.json
grep -l "PreToolUse" $CODEX_HOME/plugins/cache/fusengine-plugins/*/local/hooks.json

# Vérifier les feature flags Codex
grep -E "codex_hooks|plugin_hooks" $CODEX_HOME/config.toml

# Re-run installation (macOS/Linux)
$CODEX_HOME/plugins/marketplaces/fusengine-plugins/setup.sh

# Re-run installation (Windows PowerShell)
~\.codex\plugins\marketplaces\fusengine-plugins\setup.ps1
```

### Hook not executing

Test direct d'un guard Codex :

```bash
# PreToolUse codexignore-guard
echo '{"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":"/tmp/test/.env"},"cwd":"/tmp/test"}' \
  | python3 $CODEX_HOME/plugins/cache/fusengine-plugins/core-guards/local/scripts/pre-tool-use/codexignore-guard.py

# PostToolUse sync-transcript
echo '{"hook_event_name":"PostToolUse","tool_name":"Bash","tool_input":{"command":"ls"},"cwd":"/tmp/test"}' \
  | python3 $CODEX_HOME/plugins/cache/fusengine-plugins/core-guards/local/scripts/post-tool-use/sync-transcript-to-session.py
```

### Debug mode
Add to your hook script:
```bash
echo "[DEBUG] Hook triggered: $TOOL_NAME on $FILE_PATH" >&2
```
