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
