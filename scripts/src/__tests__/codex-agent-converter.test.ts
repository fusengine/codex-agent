import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convertPluginAgents, installCodexAgents } from "../services/codex-agent-converter";

const TEST_DIR = "/tmp/fusengine-codex-agent-converter-test";

function writeAgent(plugin: string, file: string, text: string): void {
	const dir = join(TEST_DIR, "marketplace/plugins", plugin, "agents");
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, file), text);
}

describe("codex agent converter", () => {
	afterEach(() => {
		rmSync(TEST_DIR, { recursive: true, force: true });
	});

	test("converts plugin markdown agents to native Codex TOML", () => {
		writeAgent("ai-pilot", "research-expert.md", `---
name: research-expert
description: Read-only research agent
model: sonnet
---

# Research

Use Context7 and Exa.
`);

		const agents = convertPluginAgents(join(TEST_DIR, "marketplace/plugins"));

		expect(agents).toHaveLength(1);
		expect(agents[0].name).toBe("fuse_ai_pilot_research_expert");
		expect(agents[0].fileName).toBe("fuse-ai-pilot-research-expert.toml");
		expect(agents[0].toml).toContain('sandbox_mode = "read-only"');
		expect(agents[0].toml).toContain('developer_instructions = """');
		expect(agents[0].toml).toContain('model = "gpt-5.4-mini"');
		expect(agents[0].toml).toContain("[mcp_servers.context7]");
		expect(agents[0].toml).toContain("[mcp_servers.exa]");
		expect(agents[0].toml).toContain("Source agent: ai-pilot/agents/research-expert.md");
	});

	test("throws on empty body", () => {
		writeAgent("ai-pilot", "empty.md", `---\nname: empty\n---\n\n`);
		expect(() => convertPluginAgents(join(TEST_DIR, "marketplace/plugins"))).toThrow(/Empty body/);
	});

	test("omits model field when alias missing or unknown", () => {
		writeAgent("ai-pilot", "no-model.md", `---\nname: no-model\n---\n\n# Body\n`);
		const agents = convertPluginAgents(join(TEST_DIR, "marketplace/plugins"));
		expect(agents[0].toml).not.toMatch(/^model = /m);
	});

	test("installs generated agents under CODEX_HOME agents directory", () => {
		writeAgent("nextjs-expert", "nextjs-expert.md", `---
name: nextjs-expert
model: opus
---

# Next.js Expert
`);

		installCodexAgents({
			agentsDir: join(TEST_DIR, "home/.codex/agents"),
			configToml: join(TEST_DIR, "home/.codex/config.toml"),
			hooksJson: join(TEST_DIR, "home/.codex/hooks.json"),
			marketplaceRoot: join(TEST_DIR, "marketplace"),
		});

		const file = join(TEST_DIR, "home/.codex/agents/fuse-nextjs-nextjs-expert.toml");
		const content = readFileSync(file, "utf8");
		expect(content).toContain('name = "fuse_nextjs_nextjs_expert"');
		expect(content).toContain('model_reasoning_effort = "high"');
		expect(content).toContain('model = "gpt-5.4"');
	});
});
