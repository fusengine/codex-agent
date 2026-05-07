/**
 * Hook execution service
 * Single Responsibility: Execute commands and collect results
 */
import type { ExecutableHook, HookResult } from "../interfaces/hooks";
import { mergeJsonOutput } from "./merge-utils";

const HOOK_TIMEOUT_MS = 10_000;

function isPreToolUse(input: string): boolean {
	try {
		return JSON.parse(input).hook_event_name === "PreToolUse";
	} catch {
		return false;
	}
}

/** Execute a hook and return the result */
export async function executeHook(
	hook: ExecutableHook,
	input: string,
): Promise<HookResult> {
	if (hook.isAsync) {
		const proc = Bun.spawn(["bash", "-c", hook.command], {
			stdout: "ignore",
			stderr: "ignore",
		});
		await proc.exited;
		return { success: true, exitCode: 0, stdout: "", stderr: "", blocked: false };
	}

	const proc = Bun.spawn(["bash", "-c", hook.command], {
		stdin: new TextEncoder().encode(input),
		stdout: "pipe",
		stderr: "pipe",
	});

	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		proc.kill();
	}, HOOK_TIMEOUT_MS);
	const exitCode = await proc.exited.finally(() => clearTimeout(timer));
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();

	if (timedOut) {
		const message = `${hook.pluginName}: hook timed out after ${HOOK_TIMEOUT_MS}ms`;
		return {
			success: false,
			exitCode: 124,
			stdout,
			stderr: `${message}\n${stderr}`,
			blocked: isPreToolUse(input),
		};
	}
	return { success: exitCode === 0, exitCode, stdout, stderr, blocked: exitCode === 2 };
}

/** Execute a list of hooks in PARALLEL, check for blocks after execution */
export async function executeHooks(
	hooks: ExecutableHook[],
	input: string,
): Promise<{ blocked: boolean; stderr: string; output: string }> {
	if (hooks.length === 0) {
		return { blocked: false, stderr: "", output: "" };
	}

	const results = await Promise.all(
		hooks.map((hook) => executeHook(hook, input)),
	);

	const blockedResult = results.find((r) => r.blocked);
	if (blockedResult) {
		return { blocked: true, stderr: blockedResult.stderr, output: "" };
	}

	let collectedOutput = "";
	const collectedStderr: string[] = [];

	for (const result of results) {
		if (result.stdout.trim()) {
			collectedOutput = mergeJsonOutput(collectedOutput, result.stdout);
		}
		if (result.stderr.trim()) {
			collectedStderr.push(result.stderr);
		}
	}

	return {
		blocked: false,
		stderr: collectedStderr.join(""),
		output: collectedOutput,
	};
}
