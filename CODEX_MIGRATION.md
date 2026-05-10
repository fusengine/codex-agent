# Codex Migration

Current state of the migration to Codex CLI 0.128+.

## What is native to Codex

Codex CLI 0.128 officially supports the following hook events:

- `PreToolUse`, `PostToolUse`
- `SessionStart`, `UserPromptSubmit`
- `Stop`, `PermissionRequest`

Matchers recognized by Codex (strict whitelist):

- `Bash` — shell execution
- `apply_patch` — accepted alias for `Write` / `Edit` (hooks use `Write|Edit`, the installer rewrites if needed)
- `mcp__<server>__<tool>` — MCP calls

Any other matcher (`Read`, `web_search`, `spawn_agent`, `Task`, etc.) is **silently ignored** by Codex.

## Non-hookable native tools

Codex emits several calls that hooks cannot intercept directly:

- `read_file`, `view_image`
- `web_search`, `imagegen`
- `spawn_agent`, `apply_patch` (in internal mode)
- generic `tool_search_call`, `function_call`

**Implemented solution:** a `transcript-watcher.py` started at `SessionStart` (POSIX double-fork) tails the rollout JSONL (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`) and captures these events. A `PostToolUse` hook (`sync-transcript-to-session.py`) reads the buffer, classifies the events (explore/research) and pushes them into the session-state used by APEX guards.

Modules:

- `plugins/core-guards/scripts/transcript-watcher.py` — SessionStart entrypoint
- `plugins/core-guards/scripts/lib/transcript_watch.py` — polling loop + detachment
- `plugins/core-guards/scripts/lib/transcript_events.py` — normalized event extraction
- `plugins/core-guards/scripts/lib/transcript_classifier.py` — explore vs research classification
- `plugins/core-guards/scripts/post-tool-use/sync-transcript-to-session.py` — sync to session-state

## Installed hooks

The installer (`setup.sh` / `setup.ps1`):

1. Copies each plugin to `~/.codex/plugins/cache/fusengine-plugins/<plugin>/local/`
2. Mirrors `plugins/_shared/` to `~/.codex/plugins/cache/fusengine-plugins/<plugin>/_shared/` (resolved via `..` x3 from `scripts/`)
3. Rewrites relative `./scripts/...` paths to absolute paths in `hooks.json`
4. Enables `[features] hooks = true` (canonical key since 0.129+, PR openai/codex#20522 — `codex_hooks` is accepted as a legacy alias)

## Codex feature flags

The installer writes the following non-interactive defaults to `~/.codex/config.toml` (audited against Codex 0.130, source `codex-rs/features/src/lib.rs`):

```toml
[features]
# Core stable
hooks = true
tool_search = true
personality = true
multi_agent = true
# Stable QoL — already true by default in Codex, made explicit for traceability
fast_mode = true
shell_snapshot = true
enable_request_compression = true
skill_mcp_dependency_install = true
# Experimental opt-in
memories = true
goals = true
```

**Removed in Codex 0.129+ — no longer written:**

- `undo` — `GhostCommit` feature retired
- `steer` — now default behavior (Enter submits)

**UnderDevelopment flags — intentionally NOT forced** (Codex defaults applied so promotions to Stable are picked up automatically):

- `chronicle`, `enable_fanout`, `child_agents_md`, `plugin_hooks`

Interactive prompts via `@clack/prompts`:

- `memories` — persistent knowledge
- `apps` — third-party apps
- `approval_policy` — approval policy
- `sandbox_mode` — sandbox mode
- `web_search` — native web search
- `model_reasoning_effort` — reasoning effort

The legacy `personality` string prompt (`pragmatic|friendly|none`) was removed: top-level `personality` is not a Codex schema field and was silently ignored. The `[features] personality` boolean is now set in defaults.

Modules:

- `scripts/src/services/codex-features-defaults.ts`
- `scripts/src/services/codex-features-prompts.ts`
- `scripts/src/services/codex-features-toml.ts`
- `scripts/src/services/codex-features.ts`

## Sprint 1 — recent guards

| Guard | Type | Description |
|-------|------|-------------|
| `codexignore-guard.py` | PreToolUse `Write\|Edit` | Blocks writes on paths matching `.codexignore` (gitignore-style) |
| `notify-completion.py` | Stop | Cross-platform TTS: `afplay` (macOS), `paplay`/`aplay`/`mpv`/`ffplay` (Linux), `SoundPlayer` (Windows) |
| `transcript-watcher.py` | SessionStart | Captures non-hookable native tools by tailing the rollout JSONL |

`.codexignore` supports gitignore-style patterns:

```
.env
.env.*
secrets/
*.key
credentials.json
```

## Sprint 2 — Codex 0.130 compliance

Sprint 2 aligns the converter, skills, and setup pipeline with the Codex 0.130 schema (subagents, skills, plugins).

### Token-economy model mapping (Anthropic → Codex)

`scripts/src/services/codex-model-mapper.ts` maps Anthropic aliases used in plugin agents to Codex models with explicit reasoning effort:

| Anthropic alias | Codex model      | Reasoning effort |
|-----------------|------------------|------------------|
| `opus`          | `gpt-5.5`        | `high`           |
| `sonnet`        | `gpt-5.4`        | `medium`         |
| `haiku`         | `gpt-5.4-mini`   | `low`            |
| missing / unknown | omitted (inherits parent session) | `medium` |

Rationale (refreshed for GPT-5.5, released 2026-04-23): premium reasoning agents run on `opus → gpt-5.5 high` (1.05M context, xhigh-capable). Standard agents drop to `sonnet → gpt-5.4 medium` to avoid the 2× cost of 5.5 on routine work. Fast/cheap utility agents use `haiku → gpt-5.4-mini low` — replaces the prior `gpt-5.3-codex-spark` mapping which is gated to ChatGPT Pro subscribers. Unknown aliases stay unset so the parent session model wins.

Reference: [developers.openai.com/codex/subagents](https://developers.openai.com/codex/subagents).

### Subagent filename format

Legacy: `~/.codex/agents/fusengine-<agent>.toml`.
New: `~/.codex/agents/<plugin-slug>-<agent>.toml` (e.g. `fuse-ai-pilot-research-expert.toml`). The `fusengine-` prefix is gone — it added no namespacing value and clashed with the plugin-slug convention.

The cleanup logic in the installer removes **both** legacy `fusengine-*.toml` and the new `<plugin-slug>-*.toml` shape on each run, so a migration from a previous setup leaves no orphan files.

`developer_instructions` in each generated TOML now records `Source agent: <plugin>/agents/<file>.md` (repo-relative, no absolute machine path leaked).

### Per-agent MCP servers

Agents that need scoped MCP access declare them in their generated TOML rather than inheriting the full parent set:

- `research-expert` → `context7`, `exa`
- `design-expert` → `gemini-design`, `magic`
- `websearch` → `exa`
- All others → inherit parent session

This keeps subagent contexts narrow and reduces tool-search noise.

### Skills frontmatter — strict compliance

Per [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills), `SKILL.md` frontmatter accepts only `name` and `description`. Sprint 2 audited and normalized all 131 SKILL.md files:

- 129 files modified, 2 already compliant
- ~410 non-standard frontmatter fields removed
- 1 description truncated and normalized to single-line (`apex`: 508 → 445 chars, all trigger keywords preserved)
- Body content of SKILL.md files left untouched

Field types removed (count): `user-invocable` (114), `references` (78), `related-skills` (74), `versions` (69), `argument-hint` (20), `allowed-tools` (13), `phase` (7), `version` (6), `context` (5), `agent` (4), `color` (1), `hooks` (1), `disable-model-invocation` (1).

### `[agents]` global config

`scripts/src/services/codex-agents-config.ts` writes the `[agents]` block to `~/.codex/config.toml` (idempotent, preserves user-set values):

```toml
[agents]
max_threads = 6
max_depth = 2
job_max_runtime_seconds = 1800
```

Reference: [developers.openai.com/codex/subagents](https://developers.openai.com/codex/subagents).

### `approval_mode` opt-in prompt

The setup adds an interactive prompt (default **No**):

> Bypass per-hook security review via `approval_mode=approve`?
> WARNING RISKY: this disables Codex's per-hook trust gate for ALL hooks (not just fusengine).
> Recommended: review hooks individually via `/hooks` in Codex TUI.

Choosing **Yes** writes top-level `approval_mode = "approve"` in `~/.codex/config.toml`. The recommended path is per-hook review via `/hooks` in the TUI — the prompt exists for CI/lab edge cases. See [installation guide → Trusting hooks](docs/getting-started/installation.md#trusting-hooks-codex-0129).

Modules:

- `scripts/src/services/codex-model-mapper.ts`
- `scripts/src/services/codex-agents-config.ts`
- `scripts/src/services/codex-features-toml.ts` (added `trustAllHooks`)
- `scripts/src/services/codex-features-prompts.ts`

## Archived hook events (unsupported by Codex)

`plugins/<plugin>/codex-unsupported-hooks.json` preserves hook events that have no direct Codex equivalent:

- `SessionEnd`, `SubagentStart`, `SubagentStop`
- `Notification`, `PreCompact`, `PostToolUseFailure`
- `TaskCompleted`, `TeammateIdle`, `InstructionsLoaded`
- Stop blocks `"type": "prompt"` (Claude Code only)

Preserved for traceability and future compatibility.

## Verification

```bash
cd scripts
bun run verify:codex
```

Or targeted guard test:

```bash
echo '{"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":"/tmp/test/.env"},"cwd":"/tmp/test"}' \
  | python3 plugins/core-guards/scripts/pre-tool-use/codexignore-guard.py
```
