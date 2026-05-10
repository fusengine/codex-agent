import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installCodexAgentsConfig } from "../services/codex-agents-config";

describe("installCodexAgentsConfig", () => {
	test("writes [agents] section with defaults", () => {
		const dir = mkdtempSync(join(tmpdir(), "agents-cfg-"));
		const cfg = join(dir, "config.toml");
		installCodexAgentsConfig(cfg);
		const text = readFileSync(cfg, "utf8");
		expect(text).toContain("[agents]");
		expect(text).toContain("max_threads = 6");
		expect(text).toContain("max_depth = 2");
		expect(text).toContain("job_max_runtime_seconds = 1800");
	});

	test("is idempotent across multiple invocations", () => {
		const dir = mkdtempSync(join(tmpdir(), "agents-cfg-"));
		const cfg = join(dir, "config.toml");
		installCodexAgentsConfig(cfg);
		const first = readFileSync(cfg, "utf8");
		installCodexAgentsConfig(cfg);
		installCodexAgentsConfig(cfg);
		expect(readFileSync(cfg, "utf8")).toBe(first);
	});

	test("preserves existing top-level keys", () => {
		const dir = mkdtempSync(join(tmpdir(), "agents-cfg-"));
		const cfg = join(dir, "config.toml");
		writeFileSync(cfg, 'approval_policy = "untrusted"\n');
		installCodexAgentsConfig(cfg);
		const text = readFileSync(cfg, "utf8");
		expect(text).toContain('approval_policy = "untrusted"');
		expect(text).toContain("[agents]");
	});
});
