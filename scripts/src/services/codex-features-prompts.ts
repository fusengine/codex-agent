/**
 * Interactive prompts for Codex feature toggles + top-level config.
 * Walks the user through optional but useful Codex 0.128+ settings.
 */
import * as p from "@clack/prompts";
import { applyCodexAnswers, type CodexFeatureAnswers } from "./codex-features-toml";

async function selectOrSkip(
	message: string,
	options: Array<{ value: string; label: string }>,
	initialValue: string,
): Promise<string> {
	const choice = await p.select({ message, options, initialValue });
	return p.isCancel(choice) ? initialValue : (choice as string);
}

async function confirmOrSkip(message: string, initialValue: boolean): Promise<boolean> {
	const choice = await p.confirm({ message, initialValue });
	return p.isCancel(choice) ? initialValue : (choice as boolean);
}

async function collectAnswers(): Promise<CodexFeatureAnswers> {
	const memories = await confirmOrSkip("Enable Codex Memories (recommended)?", true);
	const undo = await confirmOrSkip("Enable per-turn git ghost snapshots (undo)?", true);
	const apps = await confirmOrSkip("Enable ChatGPT Apps/Connectors (experimental)?", false);
	const approvalPolicy = await selectOrSkip("Approval policy:", [
		{ value: "untrusted", label: "untrusted (escalate most commands — safe)" },
		{ value: "on-request", label: "on-request (escalate only flagged ops)" },
		{ value: "never", label: "never (auto-approve all — risky)" },
	], "untrusted");
	const sandboxMode = await selectOrSkip("Sandbox mode:", [
		{ value: "workspace-write", label: "workspace-write (default)" },
		{ value: "read-only", label: "read-only (max safety)" },
		{ value: "danger-full-access", label: "danger-full-access (no sandbox)" },
	], "workspace-write");
	const webSearch = await selectOrSkip("Web search mode:", [
		{ value: "cached", label: "cached (default, fast)" },
		{ value: "live", label: "live (always fresh)" },
		{ value: "disabled", label: "disabled" },
	], "cached");
	const personality = await selectOrSkip("Personality:", [
		{ value: "pragmatic", label: "pragmatic (concise, factual)" },
		{ value: "friendly", label: "friendly" },
		{ value: "none", label: "none (no personality)" },
	], "pragmatic");
	const reasoningEffort = await selectOrSkip("Model reasoning effort:", [
		{ value: "high", label: "high (slower, deeper)" },
		{ value: "medium", label: "medium" },
		{ value: "low", label: "low (faster, shallower)" },
	], "high");
	return { memories, undo, apps, approvalPolicy, sandboxMode, webSearch, personality, reasoningEffort };
}

/** Run the interactive prompt flow and persist answers to config.toml. */
export async function promptCodexFeatures(configPath: string): Promise<void> {
	const answers = await collectAnswers();
	applyCodexAnswers(configPath, answers);
	p.log.success("Codex features configured");
}
