/**
 * Entry point for Codex features setup step.
 * Decides between non-interactive defaults and interactive prompts.
 */
import * as p from "@clack/prompts";
import { applyCodexFeatureDefaults } from "./codex-features-defaults";
import { promptCodexFeatures } from "./codex-features-prompts";

/** Run the Codex features step (interactive or with defaults). */
export async function runCodexFeaturesStep(
	configPath: string,
	nonInteractive: boolean,
): Promise<void> {
	if (nonInteractive) {
		applyCodexFeatureDefaults(configPath);
		p.log.info("Codex features: applied defaults (hooks, memories, personality, web_search=cached)");
		return;
	}
	await promptCodexFeatures(configPath);
}
