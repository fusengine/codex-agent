import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { enableMarketplacePlugins, writeMarketplaceRegistry } from "../services/codex-marketplace";

const TEST_DIR = "/tmp/fusengine-codex-marketplace-test";
const CONFIG = join(TEST_DIR, "home/.codex/config.toml");
const MARKETPLACE = join(TEST_DIR, "marketplace/fusengine-plugins");

function writeManifest(folder: string, name: string, category = "Development"): void {
	const dir = join(MARKETPLACE, "plugins", folder, ".codex-plugin");
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "plugin.json"), JSON.stringify({ name, interface: { category } }));
}

describe("codex marketplace", () => {
	afterEach(() => {
		rmSync(TEST_DIR, { recursive: true, force: true });
	});

	test("enables all marketplace plugins from manifests", () => {
		writeManifest("ai-pilot", "fuse-ai-pilot");
		writeManifest("nextjs-expert", "fuse-nextjs");
		mkdirSync(join(TEST_DIR, "home/.codex"), { recursive: true });
		writeFileSync(CONFIG, "[plugins.\"github@openai-curated\"]\nenabled = true\n");

		enableMarketplacePlugins(CONFIG, MARKETPLACE);

		const config = readFileSync(CONFIG, "utf8");
		expect(config).toContain('[plugins."fuse-ai-pilot@fusengine-plugins"]');
		expect(config).toContain('[plugins."fuse-nextjs@fusengine-plugins"]');
		expect(config).toContain('[plugins."github@openai-curated"]');
	});

	test("writes Codex marketplace registry for plugin discovery", () => {
		writeManifest("ai-pilot", "fuse-ai-pilot", "Engineering");
		writeMarketplaceRegistry(MARKETPLACE);

		const registryPath = join(MARKETPLACE, ".agents/plugins/marketplace.json");
		const registry = JSON.parse(readFileSync(registryPath, "utf8"));
		expect(registry.name).toBe("fusengine-plugins");
		expect(registry.interface.displayName).toBe("Fusengine Plugins");
		expect(registry.plugins[0].source.path).toBe("./plugins/ai-pilot");
		expect(registry.plugins[0].policy.installation).toBe("AVAILABLE");
		expect(registry.plugins[0].category).toBe("Engineering");
	});
});
