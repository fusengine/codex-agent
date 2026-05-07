/** Helpers for writing top-level keys + Codex feature answers to config.toml. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tomlString, upsertTomlKey } from "./codex-runtime-config";

export interface CodexFeatureAnswers {
	memories: boolean;
	undo: boolean;
	apps: boolean;
	approvalPolicy: string;
	sandboxMode: string;
	webSearch: string;
	personality: string;
	reasoningEffort: string;
}

export function upsertTopLevel(text: string, key: string, value: string): string {
	const lines = text.split(/\r?\n/).filter((l, i, a) => i < a.length - 1 || l.length > 0);
	const sectionStart = lines.findIndex((l) => /^\s*\[[^\]]+\]\s*$/.test(l));
	const end = sectionStart === -1 ? lines.length : sectionStart;
	for (let i = 0; i < end; i += 1) {
		const line = (lines[i] ?? "").trim();
		if (line.startsWith(`${key} `) || line.startsWith(`${key}=`)) {
			lines[i] = `${key} = ${value}`;
			return lines.join("\n");
		}
	}
	lines.splice(end, 0, `${key} = ${value}`);
	return lines.join("\n");
}

export function applyCodexAnswers(configPath: string, a: CodexFeatureAnswers): void {
	let text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	text = upsertTomlKey(text, "features", "memories", String(a.memories));
	text = upsertTomlKey(text, "features", "undo", String(a.undo));
	text = upsertTomlKey(text, "features", "apps", String(a.apps));
	text = upsertTopLevel(text, "approval_policy", tomlString(a.approvalPolicy));
	text = upsertTopLevel(text, "sandbox_mode", tomlString(a.sandboxMode));
	text = upsertTopLevel(text, "web_search", tomlString(a.webSearch));
	text = upsertTopLevel(text, "personality", tomlString(a.personality));
	text = upsertTopLevel(text, "model_reasoning_effort", tomlString(a.reasoningEffort));
	writeFileSync(configPath, `${text.trimEnd()}\n`);
}
