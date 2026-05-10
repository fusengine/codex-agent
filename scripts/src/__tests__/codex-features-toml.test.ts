import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyCodexAnswers, type CodexFeatureAnswers } from "../services/codex-features-toml";

const baseAnswers = (overrides: Partial<CodexFeatureAnswers> = {}): CodexFeatureAnswers => ({
	memories: true,
	apps: false,
	approvalPolicy: "untrusted",
	sandboxMode: "workspace-write",
	webSearch: "cached",
	reasoningEffort: "high",
	trustAllHooks: false,
	...overrides,
});

describe("applyCodexAnswers — trustAllHooks gate", () => {
	test("does NOT write approval_mode when trustAllHooks is false (default)", () => {
		const dir = mkdtempSync(join(tmpdir(), "features-toml-"));
		const cfg = join(dir, "config.toml");
		applyCodexAnswers(cfg, baseAnswers({ trustAllHooks: false }));
		const text = readFileSync(cfg, "utf8");
		expect(text).not.toContain("approval_mode");
	});

	test('writes approval_mode = "approve" top-level when trustAllHooks is true', () => {
		const dir = mkdtempSync(join(tmpdir(), "features-toml-"));
		const cfg = join(dir, "config.toml");
		applyCodexAnswers(cfg, baseAnswers({ trustAllHooks: true }));
		const text = readFileSync(cfg, "utf8");
		expect(text).toContain('approval_mode = "approve"');
	});
});
