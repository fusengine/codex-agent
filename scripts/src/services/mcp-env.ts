import type { McpServerConfig } from "../interfaces/mcp";
import { loadEnvFile } from "./env-file";

const ENV_REF = /\$\{([A-Z0-9_]+)\}/g;

export function expandConfigVars(obj: unknown): unknown {
	if (typeof obj === "string") return expandEnvVars(obj);
	if (Array.isArray(obj)) return obj.map(expandConfigVars);
	if (obj && typeof obj === "object") {
		const result: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(obj)) result[k] = expandConfigVars(v);
		return result;
	}
	return obj;
}

export function missingEnvVars(config: McpServerConfig): string[] {
	const envFile = loadEnvFile();
	const missing = new Set<string>();
	for (const value of configStrings(config)) {
		for (const [, name] of value.matchAll(ENV_REF)) {
			if (name !== "HOME" && name !== "CODEX_HOME" && !process.env[name] && !envFile[name]) {
				missing.add(name);
			}
		}
	}
	return [...missing].sort();
}

export function bearerTokenEnv(config: McpServerConfig): string | undefined {
	const auth = config.headers?.Authorization ?? config.headers?.authorization;
	return auth?.match(/^Bearer\s+\$\{?([A-Z0-9_]+)\}?$/i)?.[1];
}

function expandEnvVars(value: string): string {
	const home = process.env.HOME || process.env.USERPROFILE || "";
	const codexHome = process.env.CODEX_HOME || `${home}/.codex`;
	const envFile = loadEnvFile();
	return value
		.replace(/\$\{CODEX_HOME\}/g, codexHome)
		.replace(/\$CODEX_HOME/g, codexHome)
		.replace(/\$\{HOME\}/g, home)
		.replace(/\$HOME/g, home)
		.replace(ENV_REF, (match, name: string) => process.env[name] ?? envFile[name] ?? match);
}

function configStrings(obj: unknown): string[] {
	if (typeof obj === "string") return [obj];
	if (Array.isArray(obj)) return obj.flatMap(configStrings);
	if (!obj || typeof obj !== "object") return [];
	return Object.values(obj).flatMap(configStrings);
}
