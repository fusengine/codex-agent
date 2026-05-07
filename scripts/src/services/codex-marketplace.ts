import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { upsertTomlKey, tomlString } from "./codex-runtime-config";

export const FUSENGINE_MARKETPLACE = "fusengine-plugins";
const MARKETPLACE_DISPLAY_NAME = "Fusengine Plugins";

interface PluginManifest {
	interface?: { category?: string };
	name: string;
}

interface PluginEntry {
	category: string;
	name: string;
	policy: { authentication: string; installation: string };
	source: { path: string; source: string };
}

export function registerCodexMarketplace(configPath: string, source: string): void {
	mkdirSync(dirname(configPath), { recursive: true });
	const text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	const section = `marketplaces.${FUSENGINE_MARKETPLACE}`;
	const withType = upsertTomlKey(text, section, "source_type", tomlString("local"));
	const withSource = upsertTomlKey(withType, section, "source", tomlString(source));
	writeFileSync(configPath, `${withSource.trimEnd()}\n`);
}

function pluginManifests(marketplaceRoot: string): Array<PluginEntry> {
	const pluginsDir = join(marketplaceRoot, "plugins");
	if (!existsSync(pluginsDir)) return [];
	return readdirSync(pluginsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({ folder: entry.name, manifest: join(pluginsDir, entry.name, ".codex-plugin/plugin.json") }))
		.filter((entry) => existsSync(entry.manifest))
		.map((entry) => {
			const manifest = JSON.parse(readFileSync(entry.manifest, "utf8")) as PluginManifest;
			return {
				category: manifest.interface?.category ?? "Development",
				name: manifest.name,
				policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
				source: { source: "local", path: `./plugins/${entry.folder}` },
			};
		})
		.filter((entry) => Boolean(entry.name))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function writeMarketplaceRegistry(marketplaceRoot: string): void {
	const registryPath = join(marketplaceRoot, ".agents/plugins/marketplace.json");
	mkdirSync(dirname(registryPath), { recursive: true });
	const registry = {
		name: FUSENGINE_MARKETPLACE,
		interface: { displayName: MARKETPLACE_DISPLAY_NAME },
		plugins: pluginManifests(marketplaceRoot),
	};
	writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

export function enableMarketplacePlugins(configPath: string, marketplaceRoot: string): void {
	mkdirSync(dirname(configPath), { recursive: true });
	let text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	for (const plugin of pluginManifests(marketplaceRoot)) {
		text = upsertTomlKey(text, `plugins."${plugin.name}@${FUSENGINE_MARKETPLACE}"`, "enabled", "true");
	}
	writeFileSync(configPath, `${text.trimEnd()}\n`);
}
