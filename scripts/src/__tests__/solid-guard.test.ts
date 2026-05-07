import { describe, expect, test } from "bun:test";
import { codePatchPaths, structuredInlineTypes } from "../../solid-guard-patch";
import { methodologySignals } from "../../solid-guard-methodology";

describe("solid guard path detection", () => {
	test("uses Edit/Write file_path and path without patch text", () => {
		expect(codePatchPaths("", { file_path: "src/App.tsx" })).toEqual(["src/App.tsx"]);
		expect(codePatchPaths("", { path: "src/utils.ts" })).toEqual(["src/utils.ts"]);
	});

	test("ignores non-code structured paths", () => {
		expect(codePatchPaths("", { file_path: "README.md" })).toEqual([]);
	});

	test("detects inline component types in structured Edit/Write bodies", () => {
		expect(structuredInlineTypes("src/App.tsx", { new_string: "type Props = {};" })).toBe(true);
		expect(structuredInlineTypes("src/types.ts", { content: "type Props = {};" })).toBe(false);
	});
});

describe("solid guard methodology signals", () => {
	test("tracks SKILL.md separately from docs/reference reads", () => {
		expect(methodologySignals({
			tool_input: { command: "sed -n '1,20p' plugins/foo/SKILL.md" },
		})).toEqual(["skillReadAt"]);
		expect(methodologySignals({
			tool_input: { command: "sed -n '1,20p' plugins/foo/references/api.md" },
		})).toEqual(["docReadAt"]);
	});

	test("detects Exa and Context7 only from tool ids", () => {
		expect(methodologySignals({
			tool_input: { command: "please use exa and context7 before editing" },
		})).toEqual([]);
		expect(methodologySignals({ tool_name: "mcp__exa__search" })).toEqual(["exaUsedAt"]);
		expect(methodologySignals({ tool_input: { mcp_id: "@upstash/context7-mcp" } }))
			.toEqual(["context7UsedAt"]);
	});
});
