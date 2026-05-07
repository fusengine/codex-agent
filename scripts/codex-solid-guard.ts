#!/usr/bin/env bun
export {};

import {
	codePatchPaths,
	countLines,
	hasInlineTypesInComponent,
	structuredInlineTypes,
} from "./solid-guard-patch";
import {
	requireMethodology,
	trackMethodology,
	type HookInput,
} from "./solid-guard-methodology";

const MAX_LINES = 100;

const raw = await Bun.stdin.text();
let data: HookInput = {};
try {
	data = JSON.parse(raw);
} catch {
	process.exit(0);
}

const command = data.tool_input?.command ?? "";

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

function emitPost(message: string): never {
	console.log(JSON.stringify({
		decision: "block",
		reason: message,
		hookSpecificOutput: {
			hookEventName: "PostToolUse",
			additionalContext: message,
		},
	}));
	process.exit(0);
}

await trackMethodology(data);

const paths = codePatchPaths(command, data.tool_input);
if (paths.length === 0) process.exit(0);

if (data.hook_event_name === "PreToolUse") {
	const missing = await requireMethodology(data, paths);
	if (missing) emitDeny(missing);

	for (const path of paths) {
		if (hasInlineTypesInComponent(path, command) || structuredInlineTypes(path, data.tool_input)) {
			emitDeny(
				`SOLID VIOLATION: ${path} declares interface/type inside a component file. ` +
					"Move contracts to src/interfaces or a dedicated types module.",
			);
		}
	}
}

if (data.hook_event_name === "PostToolUse") {
	const oversized: string[] = [];
	for (const path of paths) {
		const lines = await countLines(path);
		if (lines !== null && lines > MAX_LINES) {
			oversized.push(`${path} (${lines} lines)`);
		}
	}
	if (oversized.length > 0) {
		emitPost(
			`SOLID VIOLATION: split oversized files before continuing: ` +
				`${oversized.join(", ")}. Maximum is ${MAX_LINES} lines.`,
		);
	}
}
