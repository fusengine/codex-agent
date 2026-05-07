# Installation

## Prerequisites

- **Bun** - Install from [bun.sh](https://bun.sh)
- **Codex** - OpenAI coding agent CLI

## 1. Add Marketplace

```bash
/plugin marketplace add fusengine/codex-agent
```

## 2. Install Plugins

**All plugins:**
```bash
/plugin install fuse-ai-pilot fuse-commit-pro fuse-laravel fuse-nextjs fuse-react fuse-swift-apple-expert fuse-solid fuse-tailwindcss fuse-design fuse-prompt-engineer
```

**Or select specific:**
```bash
/plugin install fuse-ai-pilot fuse-nextjs  # Just AI pilot + Next.js
```

## 3. Run Setup

### macOS / Linux

```bash
~/.codex/plugins/marketplaces/fusengine-plugins/setup.sh
```

### Windows (PowerShell)

```powershell
~/.codex/plugins/marketplaces/fusengine-plugins/setup.ps1
```

This installs:
- **Hooks** (PreToolUse, PostToolUse, SessionStart, UserPromptSubmit, Stop, PermissionRequest) — chemins absolus réécrits pour Codex
- **`_shared/`** modules mirrorés dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/_shared/`
- **AGENTS.md** (global rules)
- **API keys** (interactive prompts if missing)
- **Shell config** (bash/zsh/fish/PowerShell)
- **Statusline**
- **MCP servers** (interactive selection of 27 servers)
- **Codex feature flags** — defaults non-interactifs (`memories`, `undo`, `chronicle`, `goals`, `enable_fanout`, `steer`, `tool_search`, `child_agents_md` = `true`) + 8 prompts interactifs (`memories`, `undo`, `apps`, `approval_policy`, `sandbox_mode`, `web_search`, `personality`, `model_reasoning_effort`)

## 4. MCP Server Selection

During setup, you'll see an interactive MCP server selector:

```
◆  Install MCP servers to global scope?
│  ● Yes / ○ No

◆  Select MCP servers to install globally:
│  ◻ sequential-thinking  Dynamic problem-solving with step-by-step reasoning
│  ◻ memory               Knowledge graph-based persistent memory system
│  ◻ filesystem           Secure local file operations with configurable access
│  ◻ context7 [✓]         Up-to-date documentation for any library
│  ◻ exa [⚠ key missing]  Advanced AI-powered web search and research
```

- `[✓]` = API key configured
- `[⚠ key missing]` = requires API key (will still work, just configure key later)

Use arrow keys to navigate, space to select, enter to confirm.

See [MCP Servers Reference](../reference/mcp-servers.md) for full list of 27 available servers.

## 5. Restart Codex

```bash
exit
codex
```

## 6. Verify Installation

```bash
/plugin list  # Shows installed plugins
```

## Protect sensitive files — `.codexignore`

Créer un `.codexignore` à la racine du projet pour bloquer les writes sur des fichiers sensibles. Syntaxe gitignore-style :

```
.env
.env.*
secrets/
*.key
credentials.json
```

Le guard `codexignore-guard.py` (PreToolUse `Write|Edit`) remonte l'arbre depuis `cwd` jusqu'à trouver le fichier, puis applique les patterns via `fnmatch`. Match → `permissionDecision: "deny"`.

## Manual API Keys Configuration

If you skipped API keys during setup, edit `~/.codex/.env`:

```bash
export CONTEXT7_API_KEY="ctx7sk-xxx"
export EXA_API_KEY="xxx"
export MAGIC_API_KEY="xxx"
export GEMINI_DESIGN_API_KEY="xxx"
```

Then re-run setup or restart your terminal.

## Troubleshooting

### Bun not found
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Hooks not working
```bash
# Re-run setup
~/.codex/plugins/marketplaces/fusengine-plugins/setup.sh  # or setup.ps1 on Windows
```

### Check hooks installation

Sous Codex, les hooks sont installés directement par plugin dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/hooks.json` (chemins absolus réécrits par l'installer). Vérifier qu'ils existent :

```bash
ls ~/.codex/plugins/cache/fusengine-plugins/*/local/hooks.json
grep -l "PreToolUse" ~/.codex/plugins/cache/fusengine-plugins/*/local/hooks.json
```

Vérifier les feature flags Codex :

```bash
grep -E "codex_hooks|plugin_hooks|memories|undo|chronicle" ~/.codex/config.toml
```
