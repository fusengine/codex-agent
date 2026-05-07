import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	buildCodexMcpAddArgs,
	installMcpServers,
	missingEnvVars,
} from "../services/mcp-installer";

describe("buildCodexMcpAddArgs", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv, HOME: "/tmp/test-home", TEST_TOKEN: "abc" };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	test("builds stdio server command for current Codex CLI", () => {
		const args = buildCodexMcpAddArgs("demo", {
			_description: "Demo",
			type: "stdio",
			command: "npx",
			args: ["-y", "demo-server", "${HOME}"],
			env: { DEMO_TOKEN: "${TEST_TOKEN}" },
			requiresApiKey: false,
		});

		expect(args).toEqual([
			"codex",
			"mcp",
			"add",
			"demo",
			"--env",
			"DEMO_TOKEN=abc",
			"--",
			"npx",
			"-y",
			"demo-server",
			"/tmp/test-home",
		]);
	});

	test("builds http server command for current Codex CLI", () => {
		const args = buildCodexMcpAddArgs("docs", {
			_description: "Docs",
			type: "http",
			url: "https://example.com/mcp?token=${TEST_TOKEN}",
			requiresApiKey: true,
		});

		expect(args).toEqual([
			"codex",
			"mcp",
			"add",
			"docs",
			"--url",
			"https://example.com/mcp?token=abc",
		]);
	});

	test("rejects unresolved environment placeholders", () => {
		delete process.env.TEST_TOKEN;
		const config = {
			_description: "Docs",
			type: "http" as const,
			url: "https://example.com/mcp?token=${TEST_TOKEN}",
			requiresApiKey: true,
		};

		expect(missingEnvVars(config)).toEqual(["TEST_TOKEN"]);
		expect(() => buildCodexMcpAddArgs("docs", config)).toThrow(
			"unresolved env vars: TEST_TOKEN",
		);
	});

	test("reports missing env vars without spawning codex", async () => {
		delete process.env.TEST_TOKEN;
		const result = await installMcpServers(["docs"], {
			mcpServers: {
				docs: {
					_description: "Docs",
					type: "http",
					url: "https://example.com/mcp?token=${TEST_TOKEN}",
					requiresApiKey: true,
				},
			},
		});

		expect(result.success).toEqual([]);
		expect(result.failed).toEqual(["docs (missing env: TEST_TOKEN)"]);
	});
});
