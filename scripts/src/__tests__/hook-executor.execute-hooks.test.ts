import { describe, expect, test } from "bun:test";
import type { ExecutableHook } from "../interfaces/hooks";
import { executeHooks } from "../services/hook-executor";

function hook(command: string, pluginName = "test-plugin"): ExecutableHook {
	return { command, isAsync: false, pluginName };
}

describe("executeHooks", () => {
	test("returns empty result for no hooks", async () => {
		const result = await executeHooks([], "{}");
		expect(result.blocked).toBe(false);
		expect(result.output).toBe("");
	});

	test("collects JSON output with additionalContext", async () => {
		const result = await executeHooks([hook(`echo '{"additionalContext": "extra"}'`)], "{}");
		expect(result.blocked).toBe(false);
		expect(result.output).toContain("extra");
	});

	test("ignores non-JSON output", async () => {
		const result = await executeHooks([hook("echo 'plain text output'")], "{}");
		expect(result.blocked).toBe(false);
		expect(result.output).toBe("");
	});

	test("detects blocked hook", async () => {
		const result = await executeHooks([hook("echo 'blocked reason' >&2 && exit 2")], "{}");
		expect(result.blocked).toBe(true);
		expect(result.stderr).toContain("blocked reason");
	});

	test("merges multiple additionalContext outputs", async () => {
		const result = await executeHooks([
			hook(`echo '{"additionalContext": "info1"}'`, "p1"),
			hook(`echo '{"additionalContext": "info2"}'`, "p2"),
		], "{}");
		expect(result.output).toContain("info1");
		expect(result.output).toContain("info2");
	});
});
