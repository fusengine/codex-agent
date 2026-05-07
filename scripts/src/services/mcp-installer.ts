import { join } from "node:path";
import type { McpCatalog, McpServerConfig } from "../interfaces/mcp";
import { bearerTokenEnv, expandConfigVars, missingEnvVars } from "./mcp-env";

const MCP_JSON_PATH = join(import.meta.dir, "../../mcp/mcp.json");

export async function loadMcpCatalog(): Promise<McpCatalog> {
	const file = Bun.file(MCP_JSON_PATH);
	return await file.json();
}

export async function installMcpServer(
	name: string,
	config: McpServerConfig,
): Promise<boolean> {
	return (await installMcpServerWithReason(name, config)).ok;
}

async function installMcpServerWithReason(
	name: string,
	config: McpServerConfig,
): Promise<{ ok: boolean; reason?: string }> {
	try {
		const missing = missingEnvVars(config);
		if (missing.length > 0) {
			return { ok: false, reason: `missing env: ${missing.join(", ")}` };
		}
		const proc = Bun.spawn(buildCodexMcpAddArgs(name, config), {
			stdout: "ignore",
			stderr: "pipe",
		});
		const exitCode = await proc.exited;
		if (exitCode === 0) return { ok: true };
		const stderr = proc.stderr ? await new Response(proc.stderr).text() : "";
		return { ok: false, reason: compactError(stderr) || `codex exited ${exitCode}` };
	} catch (error) {
		return { ok: false, reason: error instanceof Error ? error.message : String(error) };
	}
}

export function buildCodexMcpAddArgs(
	name: string,
	config: McpServerConfig,
): string[] {
	const missing = missingEnvVars(config);
	if (missing.length > 0) {
		throw new Error(`MCP server ${name} has unresolved env vars: ${missing.join(", ")}`);
	}
	const expanded = expandConfigVars(config) as McpServerConfig;
	const args = ["codex", "mcp", "add", name];

	if (expanded.type === "http") {
		if (!expanded.url) throw new Error(`MCP server ${name} is missing url`);
		args.push("--url", expanded.url);
		const bearerEnv = bearerTokenEnv(config);
		if (bearerEnv) args.push("--bearer-token-env-var", bearerEnv);
		return args;
	}

	if (!expanded.command) throw new Error(`MCP server ${name} is missing command`);
	for (const [key, value] of Object.entries(expanded.env ?? {})) {
		args.push("--env", `${key}=${value}`);
	}
	args.push("--", expanded.command, ...(expanded.args ?? []));
	return args;
}

function compactError(value: string): string {
	return value.trim().split("\n").find(Boolean)?.slice(0, 160) ?? "";
}

export async function installMcpServers(
	names: string[],
	catalog: McpCatalog,
): Promise<{ success: string[]; failed: string[] }> {
	const success: string[] = [];
	const failed: string[] = [];

	for (const name of names) {
		const config = catalog.mcpServers[name];
		if (!config) continue;

		const result = await installMcpServerWithReason(name, config);
		if (result.ok) {
			success.push(name);
		} else {
			failed.push(result.reason ? `${name} (${result.reason})` : name);
		}
	}

	return { success, failed };
}

export { buildMcpOptions, getDefaultSelections, hasApiKey } from "./mcp-defaults";
export { missingEnvVars } from "./mcp-env";
