/**
 * Default Codex feature values applied in non-interactive mode.
 * Picks safe, useful settings without forcing risky choices on the user.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tomlString, upsertTomlKey } from "./codex-runtime-config";

// Codex 0.130 [features] flags applied non-interactively.
// Source: codex-rs/features/src/lib.rs @ openai/codex main.
//
// Removed in Codex 0.129+ (kept here as historical reference, not written):
//   ["undo", "true"]   -> GhostCommit feature retired
//   ["steer", "true"]  -> now default behavior (Enter submits)
//
// UnderDevelopment flags (chronicle, enable_fanout, child_agents_md,
// plugin_hooks) intentionally NOT forced. Codex defaults apply so promotions
// to Stable are picked up automatically.
const NON_INTERACTIVE_FEATURES: Array<[string, "true" | "false"]> = [
	// Core stable
	["hooks", "true"],
	["tool_search", "true"],
	["personality", "true"],
	["multi_agent", "true"],
	// Stable QoL — already true by default in Codex, made explicit for traceability
	["fast_mode", "true"],
	["shell_snapshot", "true"],
	["enable_request_compression", "true"],
	["skill_mcp_dependency_install", "true"],
	// Experimental opt-in
	["memories", "true"],
	["goals", "true"],
];
const NON_INTERACTIVE_TOPLEVEL: Array<[string, string]> = [
	["web_search", tomlString("cached")],
];

function upsertTopLevel(text: string, key: string, value: string): string {
	const lines = text
		.split(/\r?\n/)
		.filter((line, index, all) => index < all.length - 1 || line.length > 0);
	const sectionStart = lines.findIndex((line) => /^\s*\[[^\]]+\]\s*$/.test(line));
	const end = sectionStart === -1 ? lines.length : sectionStart;
	for (let i = 0; i < end; i += 1) {
		const line = (lines[i] ?? "").trim();
		if (line.startsWith(`${key} `) || line.startsWith(`${key}=`)) {
			lines[i] = `${key} = ${value}`;
			return lines.join("\n");
		}
	}
	lines.splice(end, 0, `${key} = ${value}`);
	return lines.join("\n");
}

/** Apply safe defaults to config.toml when running non-interactively. */
export function applyCodexFeatureDefaults(configPath: string): void {
	let text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	for (const [feature, value] of NON_INTERACTIVE_FEATURES) {
		text = upsertTomlKey(text, "features", feature, value);
	}
	for (const [key, value] of NON_INTERACTIVE_TOPLEVEL) {
		text = upsertTopLevel(text, key, value);
	}
	writeFileSync(configPath, `${text.trimEnd()}\n`);
}
