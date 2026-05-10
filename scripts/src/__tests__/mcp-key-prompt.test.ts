import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncShellEnvToCodexFile } from "../services/mcp-key-prompt";

const KEY_A = "TEST_FUSENGINE_API_KEY_A";
const KEY_B = "TEST_FUSENGINE_API_KEY_B";

const envBackup = new Map<string, string | undefined>();
const codexHomeBackup = process.env.CODEX_HOME;

beforeEach(() => {
	const dir = mkdtempSync(join(tmpdir(), "mcp-key-prompt-"));
	process.env.CODEX_HOME = dir;
	envBackup.set(KEY_A, process.env[KEY_A]);
	envBackup.set(KEY_B, process.env[KEY_B]);
	delete process.env[KEY_A];
	delete process.env[KEY_B];
});

afterEach(() => {
	for (const [k, v] of envBackup) {
		if (v === undefined) delete process.env[k];
		else process.env[k] = v;
	}
	if (codexHomeBackup === undefined) delete process.env.CODEX_HOME;
	else process.env.CODEX_HOME = codexHomeBackup;
});

describe("syncShellEnvToCodexFile", () => {
	test("copies process.env keys into ~/.codex/.env when missing", () => {
		process.env[KEY_A] = "shell-value-A";
		const cfg = join(process.env.CODEX_HOME!, ".env");

		syncShellEnvToCodexFile([KEY_A]);

		expect(existsSync(cfg)).toBe(true);
		const text = readFileSync(cfg, "utf8");
		expect(text).toContain(`export ${KEY_A}="shell-value-A"`);
	});

	test("does NOT overwrite an existing ~/.codex/.env entry", () => {
		const cfg = join(process.env.CODEX_HOME!, ".env");
		writeFileSync(cfg, `export ${KEY_A}="file-value"\n`);
		process.env[KEY_A] = "shell-value-different";

		syncShellEnvToCodexFile([KEY_A]);

		const text = readFileSync(cfg, "utf8");
		expect(text).toContain(`export ${KEY_A}="file-value"`);
		expect(text).not.toContain("shell-value-different");
	});

	test("writes the .env file with mode 0o600 (owner-only)", () => {
		process.env[KEY_B] = "shell-value-B";
		const cfg = join(process.env.CODEX_HOME!, ".env");

		syncShellEnvToCodexFile([KEY_B]);

		const mode = statSync(cfg).mode & 0o777;
		expect(mode).toBe(0o600);
	});
});
