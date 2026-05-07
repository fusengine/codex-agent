/**
 * Default Codex feature values applied in non-interactive mode.
 * Picks safe, useful settings without forcing risky choices on the user.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tomlString, upsertTomlKey } from "./codex-runtime-config";

const NON_INTERACTIVE_FEATURES: Array<[string, "true" | "false"]> = [
	["memories", "true"],
	["undo", "true"],
	["chronicle", "true"],
	["goals", "true"],
	["enable_fanout", "true"],
	["steer", "true"],
	["tool_search", "true"],
	["child_agents_md", "true"],
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
