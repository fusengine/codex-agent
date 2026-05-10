/**
 * Codex runtime hook installer.
 * Writes the hook surface Codex currently executes: $CODEX_HOME/hooks.json.
 */
import { dirname, join } from "node:path";
import { installCodexAgents } from "./codex-agent-converter";
import {
	enableMarketplacePlugins,
	registerCodexMarketplace,
	writeMarketplaceRegistry,
} from "./codex-marketplace";
import { installMarketplacePluginCache } from "./codex-plugin-cache";
import { codexHome, marketplaceRoot as defaultMarketplaceRoot } from "./codex-paths";
import {
	configureCodexStatusLine,
	enableCodexFeature,
	enableCodexHooks,
} from "./codex-runtime-config";
import { writeCodexHooks } from "./codex-runtime-hooks";

export interface CodexRuntimePaths {
	agentsDir: string;
	configToml: string;
	hooksJson: string;
	marketplaceRoot: string;
}

export function createCodexRuntimePaths(
	home: string,
	marketplaceRoot?: string,
): CodexRuntimePaths {
	const resolvedCodexHome = codexHome(home);
	return {
		agentsDir: join(resolvedCodexHome, "agents"),
		configToml: join(resolvedCodexHome, "config.toml"),
		hooksJson: join(resolvedCodexHome, "hooks.json"),
		marketplaceRoot: marketplaceRoot ?? defaultMarketplaceRoot(home),
	};
}

export function installCodexRuntime(paths: CodexRuntimePaths): void {
	enableCodexHooks(paths.configToml);
	// `plugin_hooks` removed: it is an UnderDevelopment Codex feature unrelated
	// to standard hook execution. Our marketplace hooks load via the canonical
	// `hooks` flag enabled above (PR openai/codex#20522).
	writeMarketplaceRegistry(paths.marketplaceRoot);
	installMarketplacePluginCache(paths.marketplaceRoot, dirname(paths.configToml));
	registerCodexMarketplace(paths.configToml, paths.marketplaceRoot);
	enableMarketplacePlugins(paths.configToml, paths.marketplaceRoot);
	configureCodexStatusLine(paths.configToml);
	installCodexAgents(paths);
	writeCodexHooks(paths);
}
