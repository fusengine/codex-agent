/**
 * Writes the [agents] section to Codex config.toml.
 * Caps subagent fan-out and runtime to prevent runaway parallel tasks.
 * Reference: https://developers.openai.com/codex/config-reference (Codex 0.130+).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { upsertTomlKey } from "./codex-runtime-config";

const AGENTS_DEFAULTS = {
	max_threads: "6",
	max_depth: "2",
	job_max_runtime_seconds: "1800",
} as const;

/**
 * Idempotently install the `[agents]` section in config.toml.
 * `upsertTomlKey` overwrites the value if the key already exists.
 *
 * @param configPath Absolute path to Codex config.toml.
 */
export function installCodexAgentsConfig(configPath: string): void {
	mkdirSync(dirname(configPath), { recursive: true });
	let text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	for (const [key, value] of Object.entries(AGENTS_DEFAULTS)) {
		text = upsertTomlKey(text, "agents", key, value);
	}
	writeFileSync(configPath, `${text.trimEnd()}\n`);
}
