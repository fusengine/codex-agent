#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");

function fail(message: string): never {
	console.error(`FAIL: ${message}`);
	process.exit(1);
}

async function readJson(path: string): Promise<unknown> {
	try {
		return await Bun.file(path).json();
	} catch (error) {
		fail(`invalid JSON ${path}: ${(error as Error).message}`);
	}
}

const marketplacePath = join(root, ".agents/plugins/marketplace.json");
const marketplace = await readJson(marketplacePath) as {
	plugins?: Array<{ name?: string; source?: { source?: string; path?: string } }>;
};
const entries = marketplace.plugins ?? [];
if (entries.length === 0) fail("marketplace has no plugins");

const missing: string[] = [];
for (const entry of entries) {
	const source = entry.source;
	if (source?.source !== "local" || !source.path) continue;
	const pluginDir = resolve(root, source.path);
	if (!existsSync(pluginDir)) {
		missing.push(`${entry.name ?? "<unnamed>"} -> ${source.path}`);
		continue;
	}
	if (!existsSync(join(pluginDir, ".codex-plugin/plugin.json"))) {
		missing.push(`${entry.name ?? "<unnamed>"} missing .codex-plugin/plugin.json`);
	}
}
if (missing.length > 0) fail(`missing marketplace paths:\n${missing.join("\n")}`);

for await (const file of new Bun.Glob("plugins/*/hooks.json").scan(root)) {
	await readJson(join(root, file));
}

for await (const file of new Bun.Glob("plugins/*/.codex-plugin/plugin.json").scan(root)) {
	await readJson(join(root, file));
}

for (const file of [
	"scripts/codex-pretool-guard.ts",
	"scripts/codex-permission-guard.ts",
	"scripts/codex-skill-reporter.ts",
	"scripts/codex-solid-guard.ts",
	"scripts/solid-guard-methodology.ts",
	"scripts/solid-guard-patch.ts",
	"scripts/src/services/codex-runtime.ts",
	"scripts/src/services/codex-runtime-config.ts",
	"scripts/src/services/codex-runtime-hooks.ts",
]) {
	if (!existsSync(join(root, file))) fail(`missing runtime file ${file}`);
}

const forbiddenPattern = [
	["[Cc]", "laude"].join(""),
	"CLA" + "UDE",
	"\\.cla" + "ude-plugin",
	"~/\\.cla" + "ude",
	"CLA" + "UDE_PLUGIN_ROOT",
	process.env.HOME?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") ?? "$^",
].join("|");
const scanTargets = [
	join(root, ".agents"),
	join(root, "plugins"),
	join(root, "scripts"),
	join(root, "setup.sh"),
].filter((path) => existsSync(path) && path !== import.meta.path);
const scan = Bun.spawnSync([
	"rg",
	"-n",
	forbiddenPattern,
	...scanTargets,
	"-g",
	"!verify-codex-runtime.ts",
	"-g",
	"!**/node_modules/**",
], {
	stdout: "pipe",
	stderr: "pipe",
});
if (scan.exitCode === 0) {
	fail(`forbidden migration traces found:\n${scan.stdout.toString()}`);
}
if (scan.exitCode !== 1) {
	fail(`rg failed:\n${scan.stderr.toString()}`);
}

console.log(`OK: ${entries.length} marketplace entries`);
console.log("OK: manifests, hooks, runtime files, and migration traces verified");
