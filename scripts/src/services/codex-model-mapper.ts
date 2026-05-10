/**
 * Maps Anthropic model aliases (used in agent frontmatter) to Codex official models.
 * Token economy: opus = expensive/high quality, sonnet = mid, haiku = fast/cheap.
 * Missing/unknown values return undefined so Codex inherits the parent session model.
 */
const MODEL_MAP: Record<string, string> = {
	opus: "gpt-5.4",
	sonnet: "gpt-5.4-mini",
	haiku: "gpt-5.3-codex-spark",
};

/**
 * Resolve a Codex model id from an Anthropic alias. Returns undefined when the
 * alias is missing or unrecognised (caller should omit the `model` TOML field).
 */
export function mapToCodexModel(anthropicAlias: string | undefined): string | undefined {
	if (!anthropicAlias) return undefined;
	return MODEL_MAP[anthropicAlias.trim().toLowerCase()];
}

/**
 * Reasoning effort for a given Anthropic alias. Opus runs `high`, everything else
 * defaults to `medium`. Used regardless of whether `model` is emitted.
 */
export function effortForAlias(anthropicAlias: string | undefined): "high" | "medium" {
	return anthropicAlias?.trim().toLowerCase() === "opus" ? "high" : "medium";
}
