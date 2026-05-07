import { describe, expect, test } from "bun:test";
import type { ExecutableHook } from "../interfaces/hooks";
import { executeHooks } from "../services/hook-executor";

function hook(command: string, pluginName: string): ExecutableHook {
	return { command, isAsync: false, pluginName };
}

describe("executeHooks timeout behavior", () => {
	test("executes multiple hooks in parallel", async () => {
		const start = Date.now();
		const result = await executeHooks([
			hook("sleep 0.05 && echo 'hook1'", "p1"),
			hook("sleep 0.05 && echo 'hook2'", "p2"),
			hook("sleep 0.05 && echo 'hook3'", "p3"),
		], "{}");
		expect(result.blocked).toBe(false);
		expect(Date.now() - start).toBeLessThan(120);
	});

	test("does not block PostToolUse when a hook times out", async () => {
		const result = await executeHooks([hook("sleep 11", "slow-plugin")],
			'{"hook_event_name":"PostToolUse"}');
		expect(result.blocked).toBe(false);
		expect(result.stderr).toContain("slow-plugin: hook timed out");
	}, 12000);

	test("blocks PreToolUse when a hook times out", async () => {
		const result = await executeHooks([hook("sleep 11", "slow-plugin")],
			'{"hook_event_name":"PreToolUse"}');
		expect(result.blocked).toBe(true);
		expect(result.stderr).toContain("slow-plugin: hook timed out");
	}, 12000);
});
