import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { installMarketplacePluginCache } from "../services/codex-plugin-cache";

const TEST_DIR = "/tmp/fusengine-codex-plugin-cache-test";
const CODEX_HOME = join(TEST_DIR, "home/.codex");
const MARKETPLACE = join(TEST_DIR, "marketplace/fusengine-plugins");

function writePlugin(folder: string, name: string): void {
	const root = join(MARKETPLACE, "plugins", folder);
	mkdirSync(join(root, ".codex-plugin"), { recursive: true });
	mkdirSync(join(root, "skills/demo"), { recursive: true });
	writeFileSync(join(root, ".codex-plugin/plugin.json"), JSON.stringify({ name }));
	writeFileSync(join(root, "skills/demo/SKILL.md"), "---\nname: demo\n---\n");
}

describe("codex plugin cache", () => {
	afterEach(() => {
		rmSync(TEST_DIR, { recursive: true, force: true });
	});

	test("preinstalls local marketplace plugins into Codex cache", () => {
		writePlugin("ai-pilot", "fuse-ai-pilot");
		mkdirSync(join(MARKETPLACE, "plugins/_shared"), { recursive: true });

		installMarketplacePluginCache(MARKETPLACE, CODEX_HOME);

		const cached = join(CODEX_HOME, "plugins/cache/fusengine-plugins/fuse-ai-pilot/local");
		expect(existsSync(join(cached, ".codex-plugin/plugin.json"))).toBe(true);
		expect(readFileSync(join(cached, "skills/demo/SKILL.md"), "utf8")).toContain("demo");
		expect(existsSync(join(CODEX_HOME, "plugins/cache/fusengine-plugins/_shared"))).toBe(false);
	});
});
