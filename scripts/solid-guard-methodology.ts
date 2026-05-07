import { fusengineCache } from "./src/services/codex-paths";
export type HookInput = {
	session_id?: string;
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: {
		command?: string;
		content?: string;
		file_path?: string;
		new_string?: string;
		path?: string;
		mcp_id?: string;
		server?: string;
		server_name?: string;
	};
};
type SessionMethodology = Partial<Record<"skillReadAt" | "docReadAt" | "exaUsedAt" | "context7UsedAt", number>>;
type MethodologyState = Record<string, SessionMethodology>;
type MethodologyKey = keyof SessionMethodology;
const METHODOLOGY_TTL_SECONDS = 120;
const STATE_PATH = fusengineCache("methodology", "state.json");
async function loadState(): Promise<MethodologyState> {
	try {
		return await Bun.file(STATE_PATH).json();
	} catch {
		return {};
	}
}
async function saveState(state: MethodologyState): Promise<void> {
	await Bun.write(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, { createPath: true });
}
function sessionId(data: HookInput): string {
	return data.session_id || "global";
}
function isFresh(value: number | undefined, now: number): boolean {
	return typeof value === "number" && now - value <= METHODOLOGY_TTL_SECONDS;
}
function targetText(data: HookInput): string {
	return [
		data.tool_input?.command ?? "",
		data.tool_input?.file_path ?? "",
		data.tool_input?.path ?? "",
	].join("\n").toLowerCase();
}
function toolIds(data: HookInput): string[] {
	const input = data.tool_input ?? {};
	return [data.tool_name, input.mcp_id, input.server, input.server_name]
		.filter((value): value is string => Boolean(value))
		.map((value) => value.toLowerCase());
}
function isMcpTool(value: string, id: "exa" | "context7"): boolean {
	return value.startsWith(`mcp__${id}__`) ||
		new RegExp(`(^|[^a-z0-9])${id}([^a-z0-9]|$)`).test(value);
}
export function methodologySignals(data: HookInput): MethodologyKey[] {
	const text = targetText(data);
	const ids = toolIds(data);
	const found: MethodologyKey[] = [];
	if (/skill\.md\b/i.test(text)) found.push("skillReadAt");
	if (/\/references\/|agents\.md|readme\.md|codex_migration\.md|docs?\//i.test(text)) found.push("docReadAt");
	if (ids.some((id) => isMcpTool(id, "exa"))) found.push("exaUsedAt");
	if (ids.some((id) => isMcpTool(id, "context7"))) found.push("context7UsedAt");
	return found;
}
export async function trackMethodology(data: HookInput): Promise<void> {
	if (data.hook_event_name !== "PostToolUse") return;
	const found = methodologySignals(data);
	if (found.length === 0) return;
	const state = await loadState();
	const session = { ...(state.global ?? {}), ...(state[sessionId(data)] ?? {}) };
	const now = Date.now() / 1000;
	for (const key of found) session[key] = now;
	state[sessionId(data)] = session;
	await saveState(state);
}
export async function requireMethodology(data: HookInput, paths: string[]): Promise<string | null> {
	const state = await loadState();
	const session = { ...(state.global ?? {}), ...(state[sessionId(data)] ?? {}) };
	const now = Date.now() / 1000;
	const missing: string[] = [];
	if (!isFresh(session.skillReadAt, now)) missing.push("read the relevant SKILL.md");
	if (!isFresh(session.docReadAt, now)) missing.push("read the relevant docs/reference");
	if (!isFresh(session.exaUsedAt, now)) missing.push("consult Exa");
	if (!isFresh(session.context7UsedAt, now)) missing.push("consult Context7");
	if (missing.length === 0) return null;
	return "◆ APEX required before editing code" +
		` | Files (${paths.length}): ${paths.join(" ; ")}` +
		` | Required within ${METHODOLOGY_TTL_SECONDS}s: ${missing.join(" ; ")}` +
		" | Next: complete APEX, then retry the edit.";
}
