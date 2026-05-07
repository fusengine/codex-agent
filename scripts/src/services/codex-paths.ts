import { join } from "node:path";

export const MARKETPLACE_NAME = "fusengine-plugins";

export function userHome(): string {
	return process.env.HOME || process.env.USERPROFILE || "";
}

export function codexHome(home = userHome()): string {
	return process.env.CODEX_HOME || join(home, ".codex");
}

export function marketplaceRoot(home = userHome()): string {
	return join(codexHome(home), "plugins", "marketplaces", MARKETPLACE_NAME);
}

export function fusengineCache(...parts: string[]): string {
	return join(codexHome(), "fusengine-cache", ...parts);
}
