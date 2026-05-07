#!/usr/bin/env bun
export {};

type PermissionInput = {
	tool_input?: {
		command?: string;
		description?: string | null;
	};
};

const raw = await Bun.stdin.text();
let data: PermissionInput = {};
try {
	data = JSON.parse(raw);
} catch {
	process.exit(0);
}

const command = data.tool_input?.command ?? "";
const description = data.tool_input?.description ?? "";
const text = `${command}\n${description}`;

function emitDeny(message: string): never {
	console.log(JSON.stringify({
		hookSpecificOutput: {
			hookEventName: "PermissionRequest",
			decision: {
				behavior: "deny",
				message,
			},
		},
	}));
	process.exit(0);
}

if (/\bgit\s+reset\b.*\b--hard\b/.test(text)) {
	emitDeny("GIT GUARD: git reset --hard escalation is blocked.");
}

if (/\bgit\s+push\b.*(?:--force|-f)\b/.test(text)) {
	emitDeny("GIT GUARD: force push escalation is blocked.");
}

if (/python3?\s+-\s*<</.test(text) || /python3?\s+-c\s/.test(text)) {
	emitDeny("BASH WRITE GUARD: Python shell-generated edits are blocked. Use apply_patch/Edit instead.");
}

if (/\bsed\b[^|]*\s-i/.test(text)) {
	emitDeny("BASH WRITE GUARD: sed in-place escalation is blocked. Use apply_patch/Edit instead.");
}
