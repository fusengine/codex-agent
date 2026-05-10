/**
 * Maps Anthropic model aliases (used in agent frontmatter) to Codex official models.
 * Token economy: opus = expensive/high quality, sonnet = mid, haiku = fast/cheap.
 * Missing/unknown values return undefined so Codex inherits the parent session model.
 */
const MODEL_MAP: Record<string, string> = {
	opus: "gpt-5.5",
	sonnet: "gpt-5.4",
	haiku: "gpt-5.4-mini",
};

/**
 * Resolve a Codex model id from an Anthropic alias. Returns undefined when the
 * alias is missing or unrecognised (caller should omit the `model` TOML field).
 */
export function mapToCodexModel(anthropicAlias: string | undefined): string | undefined {
	if (!anthropicAlias) return undefined;
	return MODEL_MAP[anthropicAlias.trim().toLowerCase()];
}

const EFFORT_MAP: Record<string, "high" | "medium" | "low"> = {
	opus: "high",
	sonnet: "medium",
	haiku: "low",
};

/**
 * Reasoning effort for a given Anthropic alias. Opus = high, sonnet = medium,
 * haiku = low. Unknown aliases default to medium.
 */
export function effortForAlias(anthropicAlias: string | undefined): "high" | "medium" | "low" {
	const key = anthropicAlias?.trim().toLowerCase() ?? "";
	return EFFORT_MAP[key] ?? "medium";
}
