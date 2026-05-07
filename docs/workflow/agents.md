# Agents

21 specialized agents are converted to native Codex TOML files during setup.

## Core Agents (fuse-ai-pilot)

| Agent | Description |
|-------|-------------|
| `fuse_ai_pilot_sniper` | 7-phase code validation, DRY detection, zero linter errors |
| `fuse_ai_pilot_sniper_faster` | Quick validation, minimal output |
| `fuse_ai_pilot_explore_codebase` | Architecture discovery, patterns |
| `fuse_ai_pilot_research_expert` | Documentation with Context7/Exa |
| `fuse_ai_pilot_websearch` | Quick web research |
| `fuse_ai_pilot_seo_expert` | SEO/SEA/GEO optimization |

## Framework Experts

| Agent | Plugin | Description |
|-------|--------|-------------|
| `fuse_nextjs_nextjs_expert` | fuse-nextjs | Next.js 16+, App Router, Prisma 7 |
| `fuse_laravel_laravel_expert` | fuse-laravel | Laravel 12+, Livewire, Eloquent |
| `fuse_react_react_expert` | fuse-react | React 19, hooks, TanStack |
| `fuse_swift_apple_expert_swift_expert` | fuse-swift-apple-expert | Swift/SwiftUI, all Apple platforms |
| `fuse_tailwindcss_tailwindcss_expert` | fuse-tailwindcss | Tailwind CSS v4.1 |
| `fuse_design_design_expert` | fuse-design | UI/UX, shadcn/ui, 21st.dev |
| `fuse_shadcn_ui_shadcn_ui_expert` | fuse-shadcn-ui | shadcn/ui, Radix/Base UI detection |
| `fuse_prompt_engineer_prompt_engineer` | fuse-prompt-engineer | Prompt creation & optimization |
| `fuse_security_security_expert` | fuse-security | OWASP Top 10, CVE research, dependency audit |

## Monitoring Agents

| Agent | Plugin | Description |
|-------|--------|-------------|
| `fuse_changelog_changelog_watcher` | fuse-changelog | Codex update tracking, breaking changes, community pulse |

## Utility Agents

| Agent | Plugin | Description |
|-------|--------|-------------|
| `fuse_commit_pro_commit_detector` | fuse-commit-pro | Detect optimal commit type |
| `fuse_solid_solid_orchestrator` | fuse-solid | SOLID validation across languages |

## Agent Teams

Agents can work in parallel via Codex `spawn_agent` with separate context windows. The lead delegates tasks with exclusive file ownership per teammate.

See [Agent Teams](agent-teams.md) for delegation rules, anti-patterns, and examples.

## Usage

Agents are launched automatically based on project detection, or manually:

```
User: "Use fuse_nextjs_nextjs_expert to fix the routing"
```

Or via native Codex delegation:
```typescript
spawn_agent({
  agent_type: "fuse_nextjs_nextjs_expert",
  message: "Fix the routing issue"
})
```
