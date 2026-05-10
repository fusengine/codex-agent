/**
 * Environment file read/write service
 * Single Responsibility: Read and write .env file
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { codexHome } from "./codex-paths";

/** Resolve the .env file path lazily so CODEX_HOME overrides are honoured. */
export function envFilePath(): string {
	return join(codexHome(), ".env");
}

/**
 * Read existing variables from .env file
 */
export function loadEnvFile(): Record<string, string> {
	const file = envFilePath();
	if (!existsSync(file)) return {};

	const content = readFileSync(file, "utf8");
	const env: Record<string, string> = {};

	for (const line of content.split("\n")) {
		const match = line.match(/^export\s+(\w+)=["']?([^"'\n]*)["']?/);
		if (match) {
			env[match[1]] = match[2];
		}
	}

	return env;
}

/**
 * Save variables to .env file with mode 0o600 (owner-only).
 *
 * Secrets file pattern: only the owning user can read/write. Aligned with
 * 12-Factor (https://12factor.net/config) and tools like ~/.aws/credentials.
 */
export function saveEnvFile(env: Record<string, string>): void {
	const file = envFilePath();
	mkdirSync(dirname(file), { recursive: true });
	const lines = Object.entries(env)
		.filter(([_, value]) => value)
		.map(([key, value]) => `export ${key}="${value}"`);

	writeFileSync(file, `${lines.join("\n")}\n`, { mode: 0o600 });
}
