import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CodexRuntimePaths } from "./codex-runtime";

type HookCommand = { command?: string; [key: string]: unknown };
type HookEntry = { hooks?: HookCommand[]; [key: string]: unknown };
type HooksFile = { hooks?: Record<string, HookEntry[]>; [key: string]: unknown };

const MANAGED_PARTS = [
	"codex-pretool-guard.ts",
	"codex-solid-guard.ts",
	"codex-permission-guard.ts",
	"codex-skill-reporter.ts",
	"fusengine-hooks.log",
	"/fusengine-plugins/",
];

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

function commandHook(command: string, statusMessage?: string): HookCommand {
	return { type: "command", command, ...(statusMessage ? { statusMessage } : {}) };
}

function entry(matcher: string, hooks: HookCommand[]): HookEntry {
	return { matcher, hooks };
}

function script(paths: CodexRuntimePaths, name: string): string {
	return `bun ${shellQuote(join(paths.marketplaceRoot, "scripts", name))}`;
}

function loader(paths: CodexRuntimePaths, eventName: string): string {
	return `${script(paths, "hooks-loader.ts")} ${eventName}`;
}

function isManagedHook(hook: HookCommand): boolean {
	return typeof hook.command === "string" &&
		MANAGED_PARTS.some((part) => hook.command?.includes(part));
}

function readExistingHooks(path: string): HooksFile {
	if (!existsSync(path)) return {};
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch {
		return {};
	}
}

function mergeHooks(existing: HooksFile, generated: HooksFile): HooksFile {
	const hooks = { ...(existing.hooks ?? {}) };
	for (const [event, entries] of Object.entries(generated.hooks ?? {})) {
		const kept = (hooks[event] ?? [])
			.map((item) => ({ ...item, hooks: item.hooks?.filter((hook) => !isManagedHook(hook)) }))
			.filter((item) => item.hooks === undefined || item.hooks.length > 0);
		hooks[event] = [...kept, ...entries];
	}
	return { ...existing, hooks };
}

function fusengineHooks(paths: CodexRuntimePaths): HooksFile {
	const solid = script(paths, "codex-solid-guard.ts");
	return { hooks: {
		PreToolUse: [
			entry("Bash", [commandHook(script(paths, "codex-pretool-guard.ts"))]),
			entry("apply_patch|Edit|Write", [
				commandHook(solid, "Checking APEX/SOLID constraints"),
			]),
			entry("", [commandHook(loader(paths, "PreToolUse"), "Running plugin hooks")]),
		],
		PermissionRequest: [entry("Bash", [
			commandHook(script(paths, "codex-permission-guard.ts"), "Checking permission request"),
		])],
		PostToolUse: [
			entry("", [commandHook(solid, "Tracking APEX methodology")]),
			entry("", [commandHook(loader(paths, "PostToolUse"), "Running plugin hooks")]),
			entry("Bash", [commandHook(script(paths, "codex-skill-reporter.ts"))]),
		],
		UserPromptSubmit: [entry("", [commandHook(loader(paths, "UserPromptSubmit"))])],
		Stop: [entry("", [commandHook(loader(paths, "Stop"))])],
		SessionStart: [entry("", [commandHook(loader(paths, "SessionStart"))])],
	} };
}

export function writeCodexHooks(paths: CodexRuntimePaths): void {
	mkdirSync(dirname(paths.hooksJson), { recursive: true });
	mkdirSync(paths.marketplaceRoot, { recursive: true });
	const hooks = mergeHooks(readExistingHooks(paths.hooksJson), fusengineHooks(paths));
	writeFileSync(paths.hooksJson, `${JSON.stringify(hooks, null, 2)}\n`);
}
