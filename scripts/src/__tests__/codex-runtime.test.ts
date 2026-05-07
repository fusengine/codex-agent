import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { configureCodexStatusLine, enableCodexHooks } from "../services/codex-runtime-config";
import { writeCodexHooks } from "../services/codex-runtime-hooks";

const TEST_DIR = "/tmp/fusengine-codex-runtime-test";
const CODEX_HOME = join(TEST_DIR, "home/.codex");
const MARKETPLACE = join(TEST_DIR, "portable marketplace/fusengine-plugins");

function runtimePaths() {
	return {
		agentsDir: join(CODEX_HOME, "agents"),
		configToml: join(CODEX_HOME, "config.toml"),
		hooksJson: join(CODEX_HOME, "hooks.json"),
		marketplaceRoot: MARKETPLACE,
	};
}

function hookCommands(): string[] {
	const content = JSON.parse(readFileSync(runtimePaths().hooksJson, "utf8"));
	return Object.values(content.hooks)
		.flatMap((entries) => entries as Array<{ hooks: Array<{ command: string }> }>)
		.flatMap((entry) => entry.hooks.map((hook) => hook.command));
}

describe("codex runtime", () => {
	beforeEach(() => {
		mkdirSync(CODEX_HOME, { recursive: true });
	});

	afterEach(() => {
		rmSync(TEST_DIR, { recursive: true, force: true });
	});

	test("writes hook commands from marketplaceRoot", () => {
		writeCodexHooks(runtimePaths());

		const commands = hookCommands();
		expect(commands.every((command) => command.includes(MARKETPLACE))).toBe(true);
		expect(commands.some((command) => command.includes("$HOME/.codex"))).toBe(false);
	});

	test("preserves unrelated hooks while replacing Fusengine hooks", () => {
		writeFileSync(runtimePaths().hooksJson, JSON.stringify({
			hooks: {
				PreToolUse: [
					{ matcher: "Write", hooks: [{ type: "command", command: "echo user" }] },
					{
						matcher: "Bash",
						hooks: [{
							type: "command",
							command: "bun $HOME/.codex/plugins/marketplaces/fusengine-plugins/scripts/codex-pretool-guard.ts",
						}],
					},
				],
			},
		}));

		writeCodexHooks(runtimePaths());

		const commands = hookCommands();
		expect(commands).toContain("echo user");
		expect(commands.some((command) => command.includes("$HOME/.codex"))).toBe(false);
	});

	test("enables hooks and suppresses unstable feature warnings", () => {
		writeFileSync(runtimePaths().configToml, "[features]\nold = true\n");

		enableCodexHooks(runtimePaths().configToml);

		const config = readFileSync(runtimePaths().configToml, "utf8");
		expect(config).toContain("suppress_unstable_features_warning = true");
		expect(config).toContain("codex_hooks = true");
		expect(config).toContain("old = true");
	});

	test("configures status line and always-on notifications", () => {
		configureCodexStatusLine(runtimePaths().configToml);
		const config = readFileSync(runtimePaths().configToml, "utf8");
		expect(config).toContain("[tui]");
		expect(config).toContain("status_line = [");
		expect(config).toContain('notification_condition = "always"');
	});

});
