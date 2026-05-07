import { describe, expect, test } from "bun:test";
import type { ExecutableHook } from "../interfaces/hooks";
import { executeHook } from "../services/hook-executor";

describe("executeHook", () => {
	test("captures stdout from command", async () => {
		const hook: ExecutableHook = {
			command: "echo 'hello world'",
			isAsync: false,
			pluginName: "test",
		};
		const result = await executeHook(hook, "{}");
		expect(result.success).toBe(true);
		expect(result.stdout).toContain("hello world");
		expect(result.exitCode).toBe(0);
	});

	test("captures stderr and blocked status on exit 2", async () => {
		const hook: ExecutableHook = {
			command: "echo 'error message' >&2 && exit 2",
			isAsync: false,
			pluginName: "test",
		};
		const result = await executeHook(hook, "{}");
		expect(result.blocked).toBe(true);
		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("error message");
	});
});
