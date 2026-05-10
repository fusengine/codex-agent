/**
 * MCP server inlining for Codex subagent TOML files.
 * Codex 0.130 subagents do NOT inherit MCP servers and require full
 * server definitions in [mcp_servers.X] blocks (command/args/env or url).
 * Empty tables fail with "invalid transport".
 */

interface McpServerDef {
	command: string;
	args: readonly string[];
}

const MCP_DEFS: Record<string, McpServerDef> = {
	context7: { command: "npx", args: ["-y", "@upstash/context7-mcp"] },
	exa: {
		command: "npx",
		args: [
			"-y",
			"exa-mcp-server",
			"tools=web_search_exa,get_code_context_exa,crawling_exa,company_research_exa,linkedin_search_exa,deep_researcher_start,deep_researcher_check",
		],
	},
	"gemini-design": { command: "npx", args: ["-y", "gemini-design-mcp@latest"] },
	magic: { command: "npx", args: ["-y", "@21st-dev/magic@latest"] },
};

const MCP_BY_AGENT: Record<string, readonly string[]> = {
	"research-expert": ["context7", "exa"],
	"design-expert": ["gemini-design", "magic"],
	websearch: ["exa"],
};

const j = (v: unknown) => JSON.stringify(v);

function emit(id: string, def: McpServerDef): string {
	return [`[mcp_servers.${id}]`, `command = ${j(def.command)}`, `args = ${j(def.args)}`].join("\n");
}

/** Build TOML mcp_servers blocks for a given Markdown agent name (empty if none). */
export function mcpBlockForAgent(agentName: string): string {
	const ids = MCP_BY_AGENT[agentName];
	if (!ids) return "";
	return `\n${ids.map((id) => emit(id, MCP_DEFS[id])).join("\n\n")}\n`;
}
