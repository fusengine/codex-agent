#!/usr/bin/env bun
export {};
import { fusengineCache } from "./src/services/codex-paths";

const DEBOUNCE_SECONDS = 120;

const raw = await Bun.stdin.text();

let data: { tool_input?: { command?: string } } = {};
try {
	data = JSON.parse(raw);
} catch {
	process.exit(0);
}

const command = data.tool_input?.command ?? "";
if (!command.includes("SKILL.md")) process.exit(0);

function skillNameFromPath(path: string): string {
	const expanded = path.replace("$HOME", process.env.HOME ?? "").replace(/^~/, process.env.HOME ?? "");
	const parts = expanded.split("/");
	if (parts.at(-1) !== "SKILL.md") return "";
	const skillsIndex = parts.lastIndexOf("skills");
	if (skillsIndex >= 0 && skillsIndex + 1 < parts.length) {
		if (parts[skillsIndex + 1] === ".system" && skillsIndex + 2 < parts.length) {
			return parts[skillsIndex + 2] ?? "";
		}
		return parts[skillsIndex + 1] ?? "";
	}
	return parts.at(-2) ?? "";
}

const paths = new Set<string>();
const pathPattern = /(?:\/|~|\$HOME|\.\/)[^'"\s|]*SKILL\.md/g;
for (const match of command.matchAll(pathPattern)) {
	paths.add(match[0]);
}

const stateDir = fusengineCache("skill-reporter");
const statePath = `${stateDir}/skill-consulted-state.json`;
let state: Record<string, number> = {};
try {
	state = await Bun.file(statePath).json();
} catch {
	state = {};
}

const now = Date.now() / 1000;
const lines: string[] = [];
for (const path of paths) {
	const lastSeen = Number(state[path] ?? 0);
	if (now - lastSeen < DEBOUNCE_SECONDS) continue;
	const name = skillNameFromPath(path);
	if (!name) continue;
	lines.push(`[Skill consulted] ${name} — ${path}`);
	state[path] = now;
}

if (lines.length === 0) process.exit(0);

const message = lines.join("\n");
await Bun.write(
	`${stateDir}/skill-consulted.log`,
	`--- ${new Date().toISOString()}\n${message}\n`,
	{ createPath: true },
);
await Bun.write(statePath, `${JSON.stringify(state, null, 2)}\n`, { createPath: true });

console.log(JSON.stringify({
	hookSpecificOutput: {
		hookEventName: "PostToolUse",
		additionalContext: message,
	},
}));
