/** Helpers for writing top-level keys + Codex feature answers to config.toml. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tomlString, upsertTomlKey } from "./codex-runtime-config";

export interface CodexFeatureAnswers {
	memories: boolean;
	apps: boolean;
	approvalPolicy: string;
	sandboxMode: string;
	webSearch: string;
	reasoningEffort: string;
	trustAllHooks: boolean;
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
	// Removed in 0.129+ (no-op, not written): [features].undo
	// `personality` is a [features] boolean (Stable, default true) — set in
	// defaults, not exposed as a prompt because the legacy "pragmatic|friendly|none"
	// string was silently ignored (top-level `personality` is not a Codex schema field).
	text = upsertTomlKey(text, "features", "memories", String(a.memories));
	text = upsertTomlKey(text, "features", "apps", String(a.apps));
	text = upsertTopLevel(text, "approval_policy", tomlString(a.approvalPolicy));
	text = upsertTopLevel(text, "sandbox_mode", tomlString(a.sandboxMode));
	text = upsertTopLevel(text, "web_search", tomlString(a.webSearch));
	text = upsertTopLevel(text, "model_reasoning_effort", tomlString(a.reasoningEffort));
	if (a.trustAllHooks === true) {
		text = upsertTopLevel(text, "approval_mode", tomlString("approve"));
	}
	writeFileSync(configPath, `${text.trimEnd()}\n`);
}
