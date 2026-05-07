import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { FUSENGINE_MARKETPLACE } from "./codex-marketplace";

const RELATIVE_PATH_RE = /(^|\s)(\.\/[^\s'"|;&]+)/g;

interface HookCommand { command?: string; [key: string]: unknown }
interface HookEntry { hooks?: HookCommand[]; [key: string]: unknown }
interface HooksFile { hooks?: Record<string, HookEntry[]>; [key: string]: unknown }

/** Rewrite `./scripts/...` paths in hooks.json to absolute paths under targetDir. */
function rewriteHooksJson(targetDir: string): void {
	const hooksFile = join(targetDir, "hooks.json");
	if (!existsSync(hooksFile)) return;
	let data: HooksFile;
	try {
		data = JSON.parse(readFileSync(hooksFile, "utf8"));
	} catch {
		return;
	}
	let changed = false;
	for (const entries of Object.values(data.hooks ?? {})) {
		for (const entry of entries) {
			for (const hook of entry.hooks ?? []) {
				if (typeof hook.command !== "string") continue;
				const updated = hook.command.replace(
					RELATIVE_PATH_RE,
					(_m, prefix: string, rel: string) =>
						`${prefix}${join(targetDir, rel.slice(2))}`,
				);
				if (updated !== hook.command) {
					hook.command = updated;
					changed = true;
				}
			}
		}
	}
	if (changed) writeFileSync(hooksFile, `${JSON.stringify(data, null, 2)}\n`);
}

interface CachedPlugin {
	folder: string;
	name: string;
}

function cachedPlugins(marketplaceRoot: string): CachedPlugin[] {
	const pluginsDir = join(marketplaceRoot, "plugins");
	if (!existsSync(pluginsDir)) return [];
	return readdirSync(pluginsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.filter((entry) => existsSync(join(pluginsDir, entry.name, ".codex-plugin/plugin.json")))
		.map((entry) => ({ folder: entry.name, name: basename(entry.name) }));
}

function manifestName(marketplaceRoot: string, folder: string): string | undefined {
	const manifestPath = join(marketplaceRoot, "plugins", folder, ".codex-plugin/plugin.json");
	if (!existsSync(manifestPath)) return undefined;
	return JSON.parse(readFileSync(manifestPath, "utf8")).name as string | undefined;
}

export function installMarketplacePluginCache(marketplaceRoot: string, codexHome: string): void {
	const cacheRoot = join(codexHome, "plugins/cache", FUSENGINE_MARKETPLACE);
	rmSync(cacheRoot, { recursive: true, force: true });
	mkdirSync(cacheRoot, { recursive: true });
	const sharedSource = join(marketplaceRoot, "plugins", "_shared");
	const sharedExists = existsSync(sharedSource);
	for (const plugin of cachedPlugins(marketplaceRoot)) {
		const name = manifestName(marketplaceRoot, plugin.folder) ?? plugin.name;
		const source = join(marketplaceRoot, "plugins", plugin.folder);
		const target = join(cacheRoot, name, "local");
		cpSync(source, target, { recursive: true, force: true });
		if (sharedExists && plugin.folder !== "_shared") {
			cpSync(sharedSource, join(cacheRoot, name, "_shared"), { recursive: true, force: true });
		}
		rewriteHooksJson(target);
	}
}
