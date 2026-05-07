import { join } from "node:path";
import * as p from "@clack/prompts";
import type { SetupOptions, SetupPaths } from "../interfaces/setup";
import { runCodexFeaturesStep } from "./codex-features";
import { createCodexRuntimePaths, installCodexRuntime } from "./codex-runtime";
import { copyExecutable } from "../utils/fs-helpers";
import { configureShell } from "./env-manager";
import { configureMcpServers } from "./mcp-setup";
import { promptPerfEnv } from "./perf-env";
import {
	backupSettings,
	configureDefaults,
	DEFAULT_LANGUAGE,
	enableAgentTeams,
	isAgentTeamsEnabled,
	loadSettings,
	SUPPORTED_LANGUAGES,
	saveSettings,
} from "./settings-manager";
import { installCodexMd, installDeps, scanAndPrepare, setupStatusline } from "./setup-plugins";

async function promptLanguage(): Promise<string> {
	const choice = await p.select({
		message: "Select response language for Codex:",
		options: SUPPORTED_LANGUAGES.map((lang) => ({
			value: lang.value,
			label: lang.label,
		})),
		initialValue: DEFAULT_LANGUAGE,
	});
	return p.isCancel(choice) ? DEFAULT_LANGUAGE : (choice as string);
}

function setupOptions(input: boolean | SetupOptions): SetupOptions {
	return typeof input === "boolean"
		? { skipEnv: input, nonInteractive: false }
		: input;
}

export async function runSetup(
	paths: SetupPaths,
	input: boolean | SetupOptions,
): Promise<void> {
	const options = setupOptions(input);
	p.intro("Fusengine Plugins Setup");

	const pluginsDir = join(paths.marketplace, "plugins");
	const loaderDest = join(paths.marketplace, "scripts/hooks-loader.ts");
	await copyExecutable(paths.loaderSrc, loaderDest);
	await scanAndPrepare(pluginsDir);
	const selectedLanguage = options.nonInteractive
		? DEFAULT_LANGUAGE
		: await promptLanguage();

	const s = p.spinner();
	s.start("Configuring hooks loader...");
	backupSettings(paths.settings);
	let settings = await loadSettings(paths.settings);
	settings = configureDefaults(settings, selectedLanguage);
	const runtimePaths = createCodexRuntimePaths(process.env.HOME ?? "", paths.marketplace);
	installCodexRuntime(runtimePaths);
	s.stop("Hooks loader configured");

	await runCodexFeaturesStep(runtimePaths.configToml, options.nonInteractive);

	await installCodexMd(paths.codexMdSrc, paths.codexMdDest);
	await installDeps(pluginsDir);
	settings = await setupStatusline(pluginsDir, settings);

	if (options.nonInteractive) {
		if (!isAgentTeamsEnabled(settings)) settings = enableAgentTeams(settings);
		p.log.info("Non-interactive mode: using defaults and skipping prompts");
	} else if (!isAgentTeamsEnabled(settings)) {
		const enable = await p.confirm({
			message: "Enable Agent Teams? (beta)",
			initialValue: true,
		});
		if (enable && !p.isCancel(enable)) {
			settings = enableAgentTeams(settings);
			p.log.success("Agent Teams enabled");
		}
	} else {
		p.log.info("Agent Teams already enabled");
	}

	if (!options.nonInteractive) settings = await promptPerfEnv(settings);

	await saveSettings(paths.settings, settings);

	if (!options.skipEnv && !options.nonInteractive) {
		await configureShell();
		await configureMcpServers();
	} else if (options.nonInteractive) {
		p.log.info("Non-interactive mode: skipping shell and MCP prompts");
	}

	p.outro("Setup complete! Restart Codex to apply.");
}
