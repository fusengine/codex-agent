/**
 * MCP API Key Prompt Service
 * Single Responsibility: Prompt for missing API keys needed by selected MCP servers
 */
import * as p from "@clack/prompts";
import type { McpCatalog } from "../interfaces/mcp";
import { hasApiKey } from "./mcp-defaults";
import { loadEnvFile, saveEnvFile } from "./env-file";

/**
 * Persist any keys present in process.env to ~/.codex/.env.
 * Self-containment: Codex must not depend on shell init scripts (e.g. fish
 * conf.d sourcing ~/.claude/.env). Once a key is in the .env file, Codex
 * is the source of truth.
 */
export function syncShellEnvToCodexFile(envVars: string[]): void {
	const env = loadEnvFile();
	let changed = false;
	for (const v of envVars) {
		const fromShell = process.env[v];
		if (fromShell && !env[v]) {
			env[v] = fromShell;
			changed = true;
		}
	}
	if (changed) saveEnvFile(env);
}

/** Prompt for missing API keys needed by selected MCP servers */
export async function promptMissingKeys(
	selected: string[],
	catalog: McpCatalog,
): Promise<void> {
	const requiredKeys = selected
		.map((name) => catalog.mcpServers[name])
		.filter((c) => c.requiresApiKey && c.apiKeyEnv);

	// Self-containment: persist any process.env-only keys to ~/.codex/.env
	// before deciding what is still missing.
	syncShellEnvToCodexFile(requiredKeys.map((c) => c.apiKeyEnv!));

	const missing = requiredKeys.filter((c) => !hasApiKey(c.apiKeyEnv!));

	if (missing.length === 0) return;

	p.note(
		missing.map((c) => `  ${c.apiKeyEnv}`).join("\n"),
		`${missing.length} API key(s) required`,
	);

	const env = loadEnvFile();
	let hasChanges = false;

	for (const config of missing) {
		const value = await p.text({
			message: `${config.apiKeyEnv}`,
			placeholder: config.apiKeyUrl ?? config._description,
		});

		if (p.isCancel(value)) break;
		if (value?.trim()) {
			env[config.apiKeyEnv!] = value.trim();
			process.env[config.apiKeyEnv!] = value.trim();
			hasChanges = true;
		}
	}

	if (hasChanges) saveEnvFile(env);
}
