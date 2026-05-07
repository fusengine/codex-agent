import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { HOOK_TYPES } from "../interfaces/hooks";

export interface Settings {
	language?: string;
	attribution?: { commit: string; pr: string };
	hooks?: Record<string, unknown[]>;
	statusLine?: { type: string; command: string; padding: number };
	[key: string]: unknown;
}

// Settings IO keeps installer reads, writes, and backups in one place.
export async function loadSettings(path: string): Promise<Settings> {
	if (!existsSync(path)) return {};
	return await Bun.file(path).json();
}

export async function saveSettings(path: string, settings: Settings): Promise<void> {
	mkdirSync(dirname(path), { recursive: true });
	await Bun.write(path, `${JSON.stringify(settings, null, 2)}\n`);
}

export function backupSettings(path: string): void {
	if (!existsSync(path)) return;
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
	copyFileSync(path, `${path}.backup.${timestamp}`);
}

// Hook settings are legacy JSON settings, separate from Codex hooks.json.
export function configureHooks(
	settings: Settings,
	loaderPath: string,
): Settings {
	settings.hooks = {};

	for (const hookType of HOOK_TYPES) {
		settings.hooks[hookType] = [
			{
				matcher: "",
				hooks: [{ type: "command", command: `bun ${loaderPath} ${hookType}` }],
			},
		];
	}

	return settings;
}

// Installer language choices stay explicit so prompt labels remain stable.
export const SUPPORTED_LANGUAGES = [
	{ value: "english", label: "English" },
	{ value: "french", label: "French" },
	{ value: "german", label: "German" },
	{ value: "spanish", label: "Spanish" },
	{ value: "italian", label: "Italian" },
	{ value: "portuguese", label: "Portuguese" },
	{ value: "dutch", label: "Dutch" },
	{ value: "japanese", label: "Japanese" },
	{ value: "chinese", label: "Chinese" },
	{ value: "korean", label: "Korean" },
] as const;

export const DEFAULT_LANGUAGE = "english";

// Defaults are applied once during setup and preserve an existing language.
export function configureDefaults(
	settings: Settings,
	language?: string,
): Settings {
	settings.language = language ?? settings.language ?? DEFAULT_LANGUAGE;
	settings.attribution = { commit: "", pr: "" };
	return settings;
}

export function enableAgentTeams(settings: Settings): Settings {
	const env = (settings.env as Record<string, string>) || {};
	env.CODEX_CODE_EXPERIMENTAL_AGENT_TEAMS = "1";
	settings.env = env;
	return settings;
}

export function isAgentTeamsEnabled(settings: Settings): boolean {
	const env = settings.env as Record<string, string> | undefined;
	return env?.CODEX_CODE_EXPERIMENTAL_AGENT_TEAMS === "1";
}

// Statusline is only created when the user has no existing statusLine block.
export function configureStatusLine(
	settings: Settings,
	statuslineDir: string,
): Settings {
	if (!settings.statusLine) {
		settings.statusLine = {
			type: "command",
			command: `bun ${statuslineDir}/src/index.ts`,
			padding: 0,
		};
	}
	return settings;
}
