import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const STATUS_LINE_ITEMS = [
	"codex-version",
	"model-with-reasoning",
	"project-name",
	"context-used",
	"context-remaining",
	"five-hour-limit",
	"weekly-limit",
];

export function tomlString(value: string): string {
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function upsertTomlKey(text: string, section: string, key: string, value: string): string {
	const lines = text
		.split(/\r?\n/)
		.filter((line, index, all) => index < all.length - 1 || line.length > 0);
	const header = `[${section}]`;
	const sectionStart = lines.findIndex((line) => line.trim() === header);
	if (sectionStart === -1) {
		return [...lines, lines.length > 0 ? "" : undefined, header, `${key} = ${value}`]
			.filter((line): line is string => line !== undefined)
			.join("\n");
	}

	let sectionEnd = lines.length;
	for (let index = sectionStart + 1; index < lines.length; index += 1) {
		if (/^\s*\[[^\]]+\]\s*$/.test(lines[index] ?? "")) {
			sectionEnd = index;
			break;
		}
	}
	for (let index = sectionStart + 1; index < sectionEnd; index += 1) {
		const line = (lines[index] ?? "").trim();
		if (line.startsWith(`${key} `) || line.startsWith(`${key}=`)) {
			lines[index] = `${key} = ${value}`;
			return lines.join("\n");
		}
	}
	lines.splice(sectionEnd, 0, `${key} = ${value}`);
	return lines.join("\n");
}

function upsertTopLevelTomlKey(text: string, key: string, value: string): string {
	const lines = text
		.split(/\r?\n/)
		.filter((line, index, all) => index < all.length - 1 || line.length > 0);
	const sectionStart = lines.findIndex((line) => /^\s*\[[^\]]+\]\s*$/.test(line));
	const end = sectionStart === -1 ? lines.length : sectionStart;
	for (let index = 0; index < end; index += 1) {
		const line = (lines[index] ?? "").trim();
		if (line.startsWith(`${key} `) || line.startsWith(`${key}=`)) {
			lines[index] = `${key} = ${value}`;
			return lines.join("\n");
		}
	}
	lines.splice(end, 0, `${key} = ${value}`);
	return lines.join("\n");
}

export function enableCodexFeature(configPath: string, feature: string): void {
	mkdirSync(dirname(configPath), { recursive: true });
	const text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	const updated = upsertTomlKey(text, "features", feature, "true");
	writeFileSync(configPath, `${updated.trimEnd()}\n`);
}

export function enableCodexHooks(configPath: string): void {
	// Canonical key since Codex 0.129+ (PR openai/codex#20522).
	// Legacy alias `codex_hooks` still resolves to Feature::CodexHooks but
	// triggers a deprecation warning in 0.129. Write the canonical key.
	enableCodexFeature(configPath, "hooks");
	const text = readFileSync(configPath, "utf8");
	const updated = upsertTopLevelTomlKey(text, "suppress_unstable_features_warning", "true");
	writeFileSync(configPath, `${updated.trimEnd()}\n`);
}

export function configureCodexStatusLine(configPath: string): void {
	mkdirSync(dirname(configPath), { recursive: true });
	const text = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
	const value = `[${STATUS_LINE_ITEMS.map(tomlString).join(", ")}]`;
	let updated = upsertTomlKey(text, "tui", "status_line", value);
	updated = upsertTomlKey(updated, "tui", "notification_condition", tomlString("always"));
	writeFileSync(configPath, `${updated.trimEnd()}\n`);
}
