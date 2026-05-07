const AGENT_NAME_REPLACEMENTS: Array<[RegExp, string]> = [
	[/fuse-ai-pilot:explore-codebase/g, "fuse_ai_pilot_explore_codebase"],
	[/fuse-ai-pilot:research-expert/g, "fuse_ai_pilot_research_expert"],
	[/fuse-ai-pilot:sniper-faster/g, "fuse_ai_pilot_sniper_faster"],
	[/fuse-ai-pilot:sniper/g, "fuse_ai_pilot_sniper"],
	[/fuse-ai-pilot:websearch/g, "fuse_ai_pilot_websearch"],
	[/fuse-nextjs:nextjs-expert/g, "fuse_nextjs_nextjs_expert"],
	[/fuse-laravel:laravel-expert/g, "fuse_laravel_laravel_expert"],
	[/fuse-react:react-expert/g, "fuse_react_react_expert"],
	[/fuse-swift-apple-expert:swift-expert/g, "fuse_swift_apple_expert_swift_expert"],
	[/fuse-tailwindcss:tailwindcss-expert/g, "fuse_tailwindcss_tailwindcss_expert"],
	[/fuse-shadcn-ui:shadcn-ui-expert/g, "fuse_shadcn_ui_shadcn_ui_expert"],
	[/fuse-design:design-expert/g, "fuse_design_design_expert"],
	[/fuse-security:security-expert/g, "fuse_security_security_expert"],
	[/fuse-solid:solid-orchestrator/g, "fuse_solid_solid_orchestrator"],
	[/fuse-commit-pro:commit-detector/g, "fuse_commit_pro_commit_detector"],
];

const TOOL_REPLACEMENTS: Array<[RegExp, string]> = [
	[/TeamCreate/g, "spawn_agent team"],
	[/TaskCreate/g, "spawn_agent task"],
	[/TaskUpdate/g, "agent status update"],
	[/SendMessage/g, "send_input"],
	[/Agent\(subagent_type=/g, "spawn_agent(agent_type="],
	[/Task tool/g, "spawn_agent tool"],
	[/- ❌ /g, "- "],
	[/❌ /g, "- "],
	[/^- - /gm, "- "],
	[/Guess library IDs without `resolve-library-id`/g, "Guess unknown library IDs without resolve_library_id"],
];

export function adaptAgentInstructions(text: string): string {
	let adapted = text;
	for (const [pattern, replacement] of [...AGENT_NAME_REPLACEMENTS, ...TOOL_REPLACEMENTS]) {
		adapted = adapted.replace(pattern, replacement);
	}
	return `${adapted}

## Codex Native Agent Runtime

- This agent is installed as a Codex custom subagent TOML file.
- Use native Codex agent names with underscores, not Claude-style plugin aliases.
- Use spawn_agent, send_input, and wait_agent for delegation when available.
- For Context7, call query_docs directly when the library ID is already known.
- Keep Exa and Context7 queries narrow to avoid noisy terminal output.
`;
}
