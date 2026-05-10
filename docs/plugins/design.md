# fuse-design

Design Director hybrid plugin (v1.1.0): **impeccable methodology spine** + **Gemini Design MCP renderer**.

## Architecture

| Layer | Role |
|-------|------|
| `impeccable` skill | Deterministic methodology — sector templates (creative/fintech/ecommerce/devtool), identity system, OKLCH P3 tokens, motion profile, 27-rule audit |
| `mcp__gemini-design__*` | Renderer — generates production HTML/JSX from XML-structured design specs |
| `design-expert` agent | Thin coordinator — delegates to skill, calls renderer, returns artifacts |

## What was removed in 1.1.0

The previous 7-phase pipeline (0-identity-system → 6-handoff-review), the 20 Python phase-gating hooks, and the four `/design*` commands have been replaced by the `impeccable` methodology — a single deterministic spine that enforces the same rigor without per-tool gating.

## Agents

| Agent | Description |
|-------|-------------|
| `design-expert` | Design Director — runs `impeccable` methodology, calls Gemini Design MCP for rendering |

## Skills

| Skill | Description |
|-------|-------------|
| `impeccable` | Full design methodology: identity, research, system, generate, motion, audit, review |

## Commands

None. The agent is invoked directly or via skill triggers.

## MCP Servers

- `gemini-design` — `create_frontend`, `modify_frontend`, `snippet_frontend` (HTML/JSX generation)
- `playwright` — visual audit and inspiration browsing
- `context7` / `exa` — documentation and research

## Cross-stack handoff

See `rules/framework-integration.md` for handoff to React (`fuse-react`, `fuse-nextjs`, `fuse-shadcn-ui`), Swift (`fuse-swift-apple-expert`) and Astro (`fuse-astro`) plugins.

## Upstream

Methodology adapted from [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) (Apache 2.0). Wrapper code MIT.
