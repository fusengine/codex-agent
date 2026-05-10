# Design Expert Plugin (fuse-design v1.1.0)

Design Director hybrid: **impeccable methodology** as the deterministic spine + **Gemini Design MCP** as the HTML/JSX renderer.

## What changed in 1.1.0

The legacy 7-phase pipeline (0-identity-system → 6-handoff-review), the 20 Python phase-gating hooks, and the multiple `/design*` commands are gone. They are replaced by:

- A single skill **`impeccable`** (methodology spine — sector templates, OKLCH tokens, anti-AI-slop, deterministic 27-rule audit).
- The **`mcp__gemini-design__create_frontend`** MCP tool for actual HTML/JSX generation.
- A thin **`design-expert`** agent that delegates to the skill and calls the renderer.

## Upstream

The methodology is adapted from the [`impeccable`](https://github.com/pbakaus/impeccable) project by Paul Bakaus. The wrapper code in this plugin is licensed MIT; the methodology content inherits its upstream license (Apache 2.0).

## Cross-stack handoff

`rules/framework-integration.md` documents how the generated HTML/JSX is consumed downstream by React, Swift/SwiftUI and Astro plugins.

## Usage

Invoke the agent or trigger the `impeccable` skill directly when designing, redesigning, auditing or polishing any UI surface.
