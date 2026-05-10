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
~/.codex/.tmp/marketplaces/fusengine-plugins/setup.sh
```

### Windows (PowerShell)

```powershell
~/.codex/.tmp/marketplaces/fusengine-plugins/setup.ps1
```

This installs:
- **Hooks** (PreToolUse, PostToolUse, SessionStart, UserPromptSubmit, Stop, PermissionRequest) — chemins absolus réécrits pour Codex
- **`_shared/`** modules mirrorés dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/_shared/`
- **AGENTS.md** (global rules)
- **API keys** (interactive prompts if missing)
- **Shell config** (bash/zsh/fish/PowerShell)
- **Statusline**
- **MCP servers** (interactive selection of 27 servers)
- **Codex feature flags** (audit 0.130) — defaults non-interactifs : `hooks`, `tool_search`, `personality`, `multi_agent`, `fast_mode`, `shell_snapshot`, `enable_request_compression`, `skill_mcp_dependency_install`, `memories`, `goals` (= `true`). Removed (no-op) : `undo`, `steer`. UnderDevelopment laissés aux défauts Codex : `chronicle`, `enable_fanout`, `child_agents_md`, `plugin_hooks`. + 6 prompts interactifs : `memories`, `apps`, `approval_policy`, `sandbox_mode`, `web_search`, `model_reasoning_effort`

## Trusting hooks (Codex 0.129+)

Depuis Codex 0.129, les hooks installés par un plugin sont soumis à un **trust gate** : chaque hook doit être approuvé individuellement avant d'être exécuté. À la première exécution après installation, Codex affiche les hooks fusengine et attend une décision utilisateur.

### Recommandé — review per-hook via `/hooks` (TUI)

1. Lance Codex (`codex`).
2. Ouvre la TUI des hooks :

   ```
   /hooks
   ```

3. Codex liste chaque hook avec son chemin absolu, son matcher (`Bash`, `Write|Edit`, `mcp__*`, etc.) et l'événement (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `UserPromptSubmit`, `PermissionRequest`).
4. Inspecte le script avant d'approuver — chaque hook fusengine vit dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/scripts/`.
5. Approuve hook par hook. Le choix est mémorisé.

Cette approche per-hook est la voie supportée par OpenAI : le trust gate n'a actuellement pas de mécanisme de pre-trust applicable à un bundle d'équipe (cf. [openai/codex#21639](https://github.com/openai/codex/issues/21639)).

### Opt-in — `approval_mode = "approve"` (à éviter par défaut)

Pour les environnements où la review per-hook n'est pas tenable (CI, machines partagées en lab), `setup.sh` propose un prompt :

> Bypass per-hook security review via `approval_mode=approve`?
> WARNING RISKY: this disables Codex's per-hook trust gate for **ALL** hooks (not just fusengine).
> Recommended: review hooks individually via `/hooks` in Codex TUI.
> Default: **No**

Choisir **Yes** écrit `approval_mode = "approve"` au top-level de `~/.codex/config.toml`. Ce flag désactive le trust gate pour **tous** les hooks de la machine, fusengine et tiers compris. À n'activer qu'en pleine connaissance des hooks installés.

Voir : [developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build).

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
~/.codex/.tmp/marketplaces/fusengine-plugins/setup.sh  # or setup.ps1 on Windows
```

### Check hooks installation

Sous Codex, les hooks sont installés directement par plugin dans `~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/hooks.json` (chemins absolus réécrits par l'installer). Vérifier qu'ils existent :

```bash
ls ~/.codex/plugins/cache/fusengine-plugins/*/local/hooks.json
grep -l "PreToolUse" ~/.codex/plugins/cache/fusengine-plugins/*/local/hooks.json
```

Vérifier les feature flags Codex :

```bash
grep -E "^hooks|^tool_search|^memories|^personality" ~/.codex/config.toml
```
