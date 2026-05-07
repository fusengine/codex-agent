#!/usr/bin/env bun
/**
 * install-hooks.ts - Hook system installation entry point
 * Uses @clack/prompts for modern UI
 */
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { codexHome, marketplaceRoot, userHome } from "./src/services/codex-paths";
import { runSetup } from "./src/services/setup-runner";

const HOME = userHome();
const CODEX_HOME = codexHome(HOME);
const SCRIPT_DIR = dirname(import.meta.path);
const PROJECT_ROOT = dirname(SCRIPT_DIR);

const PATHS = {
	settings: join(CODEX_HOME, "settings.json"),
	marketplace: marketplaceRoot(HOME),
	loaderSrc: join(SCRIPT_DIR, "hooks-loader.ts"),
	scriptDir: SCRIPT_DIR,
	codexMdSrc: join(
		PROJECT_ROOT,
		"plugins/codex-rules/templates/AGENTS.md.template",
	),
	codexMdDest: join(CODEX_HOME, "AGENTS.md"),
};

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	await runSetup(PATHS, {
		skipEnv: args.includes("--skip-env"),
		nonInteractive: args.includes("--yes") || args.includes("--non-interactive"),
	});
}

main().catch((e) => {
	p.log.error(e.message);
	process.exit(1);
});
