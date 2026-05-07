#!/usr/bin/env bun
export {};
import { fusengineCache } from "./src/services/codex-paths";

const raw = await Bun.stdin.text();

function emitDeny(reason: string): never {
	console.log(JSON.stringify({
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			permissionDecision: "deny",
			permissionDecisionReason: reason,
		},
	}));
	process.exit(0);
}

await Bun.write(
	fusengineCache("hook-payloads.jsonl"),
	`--- ${new Date().toISOString()}\n${raw}${raw.endsWith("\n") ? "" : "\n"}`,
	{ createPath: true },
);

let data: { tool_input?: { command?: string } } = {};
try {
	data = JSON.parse(raw);
} catch {
	process.exit(0);
}

const command = data.tool_input?.command ?? "";
if (!command) process.exit(0);

if (/python3?\s+-\s*<</.test(command)) {
	emitDeny("BASH WRITE GUARD: Python heredoc input blocked. Use apply_patch/Edit instead.");
}

if (/python3?\s+-c\s/.test(command)) {
	emitDeny("BASH WRITE GUARD: Python inline script blocked. Use apply_patch/Edit instead.");
}

if (/\bsed\b[^|]*\s-i/.test(command)) {
	emitDeny("BASH WRITE GUARD: sed in-place edit blocked. Use apply_patch/Edit instead.");
}

if (/\bgit\s+reset\b.*\b--hard\b/.test(command)) {
	emitDeny("GIT GUARD: git reset --hard is blocked.");
}

if (/\bgit\s+push\b.*(?:--force|-f)\b/.test(command)) {
	emitDeny("GIT GUARD: force push is blocked.");
}

if (/(?<![2&\d])\s*>>?\s*(?!\/dev\/null|&)[a-zA-Z0-9_./~$-]/.test(command)) {
	if (/\.(ts|tsx|js|jsx|py|php|swift|go|rs|rb|java|vue|svelte|astro|css)\b/.test(command)) {
		emitDeny("BASH WRITE GUARD: Bash redirect to code file blocked. Use apply_patch/Edit instead.");
	}
}
