# Release Notes

## [1.0.2] - 10-05-2026

### Documentation

- docs(paths): align with Codex 0.130 install layout
  - Setup.sh references → `~/.codex/.tmp/marketplaces/<name>/` (where Codex puts the marketplace clone post `/plugin marketplace add`)
  - Runtime references (skills, agents, scripts) → `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` (per developers.openai.com/codex/plugins/build)
  - The legacy `~/.codex/plugins/marketplaces/` is created by our setup.sh as our internal hub, not by Codex itself

### Fixed

- Removed `fuse-memory` entry from `marketplace.json` (plugin code is gitignored — caused "plugin/read failed" in TUI for users installing from the public repo)
- Deleted orphan `docs/plugins/memory.md` (was already gitignored)

## [1.0.1] - 10-05-2026

### Fixed

- fix(codex): align [features] block with Codex 0.130 audit
  - `personality` no longer written top-level (silently ignored — moved to `[features]` boolean)
  - `undo` (GhostCommit retired) and `steer` (default behavior since 0.129+) no longer written
  - `codex_hooks` renamed to canonical `hooks` (PR openai/codex#20522, legacy alias preserved)
  - `plugin_hooks` removed (UnderDevelopment, unrelated to marketplace hooks)
  - UnderDevelopment flags (chronicle, enable_fanout, child_agents_md) no longer forced
  - Added Stable QoL flags: multi_agent, fast_mode, shell_snapshot, enable_request_compression, skill_mcp_dependency_install
  - HTML exemption from SOLID enforcement clarified (design previews legitimately exceed 100 lines)

## [1.0.0] - 07-05-2026

Initial release of `fusengine/codex-agent` — a multi-agent plugin marketplace for OpenAI Codex CLI 0.128+.

### Plugins (17)

- **core-guards** — security/SOLID/APEX guards, transcript watcher, cross-platform TTS, statusline
- **ai-pilot** — APEX workflow orchestrator, sniper validation, 4-level cache (60-75% token savings)
- **nextjs-expert** — Next.js 16+ App Router, RSC, Prisma 7, Better Auth
- **laravel-expert** — Laravel 12, Eloquent, Livewire, Blade, Sanctum, Stripe Connect
- **react-expert** — React 19 hooks, TanStack Router/Form, Zustand
- **astro-expert** — Astro 6 Islands, Content Layer API, Server Actions
- **swift-apple-expert** — SwiftUI all platforms (iOS/macOS/watchOS/visionOS/tvOS)
- **tailwindcss** — v4.1 CSS-first @theme/@utility, OKLCH colors
- **design-expert** — Gemini Design MCP + shadcn/ui + WCAG 2.2 accessibility
- **shadcn-ui** — Radix/Base UI primitives, registry, theming
- **security-expert** — OWASP Top 10, CVE research via NVD/OSV.dev, dependency audit
- **solid-orchestrator** — multi-language SOLID enforcement (TypeScript/PHP/Swift/Go/Java/Ruby/Rust)
- **commit-pro** — conventional commits, version bump, CHANGELOG, git tag
- **prompt-engineer** — CoT/Few-Shot/Meta-Prompting, agent design
- **changelog-watcher** — Codex updates, breaking change detection, community pulse via Exa
- **cartographer** — auto-generated navigable plugin/project maps with `/map --enrich`
- **claude-rules / fuse-rules** — methodology rules injection

### Codex CLI 0.128+ integration

- Native hook events: `PreToolUse`, `PostToolUse`, `SessionStart`, `UserPromptSubmit`, `Stop`, `PermissionRequest`
- Matchers whitelist: `Bash`, `apply_patch` (alias `Write`/`Edit`), `mcp__*`
- `transcript-watcher.py` (SessionStart, double-fork POSIX) tails rollout JSONL to capture non-hookable native tools (`read_file`, `web_search`, `spawn_agent`, `tool_search_call`)
- `sync-transcript-to-session.py` (PostToolUse) feeds APEX session-state from transcript events
- `codexignore-guard.py` (PreToolUse `Write|Edit`) — gitignore-style protection for `.env`, `secrets/`, `*.key`
- `notify-completion.py` (Stop) — cross-platform TTS: afplay (macOS), paplay/aplay/mpv/ffplay (Linux), SoundPlayer (Windows)
- Hook events without Codex equivalent (`SubagentStart`, `SubagentStop`, `SessionEnd`, `Notification`, `PreCompact`, `TaskCompleted`) preserved in `codex-unsupported-hooks.json` per plugin

### Installer

- Bun-based, SOLID architecture (services <100 lines)
- `_shared/` mirroring to `~/.codex/plugins/cache/<marketplace>/<plugin>/_shared/`
- Absolute path rewriting in `hooks.json` during install
- 8 non-interactive Codex feature flags: `codex_hooks`, `plugin_hooks`, `memories`, `undo`, `chronicle`, `goals`, `enable_fanout`, `steer`, `tool_search`, `child_agents_md`
- 8 interactive prompts via `@clack/prompts`: `approval_policy`, `sandbox_mode`, `web_search`, `personality`, `model_reasoning_effort`, ...
- API keys configuration (Context7, Exa, Magic, Gemini Design)
- 27 MCP servers selectable interactively
- Statusline TUI configuration
- AGENTS.md global rules injection

### Documentation

- Complete docs set: getting-started, workflow (APEX, agents, teams, skills, commands), per-plugin docs, reference (architecture, hooks, cache-system, MCP servers)
- Codex CLI 0.128+ alignment with Claude legacy compatibility notes
- Install path unification (`~/.codex/...` everywhere, no `$CODEX_HOME` env var, no Windows backslash mix)
