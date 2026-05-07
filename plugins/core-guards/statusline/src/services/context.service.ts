/**
 * Context Service - Calcul du contexte utilise
 *
 * @description SRP: Calcul contexte uniquement
 * @see Codex context-window accounting behavior.
 */

import { OVERHEAD_ESTIMATION, TOKEN_LIMITS } from "../constants";
import type { ContextResult, HookInput, TokenUsage } from "../interfaces";

function _calculateTotalTokens(usage: TokenUsage): number {
	return (
		usage.input_tokens +
		(usage.cache_creation_input_tokens || 0) +
		(usage.cache_read_input_tokens || 0)
	);
}

function _calculateSystemOverhead(estimateOverhead: boolean, overheadTokens?: number): number {
	if (!estimateOverhead) return 0;

	// Si un overhead custom est défini, l'utiliser
	if (overheadTokens !== undefined) return overheadTokens;

	// Otherwise, calculate with the default constants.
	const mcpTokens = OVERHEAD_ESTIMATION.MCP_PER_SERVER * OVERHEAD_ESTIMATION.DEFAULT_MCP_SERVERS;

	return (
		OVERHEAD_ESTIMATION.SYSTEM_TOOLS +
		OVERHEAD_ESTIMATION.SYSTEM_PROMPT +
		OVERHEAD_ESTIMATION.MEMORY_FILES +
		OVERHEAD_ESTIMATION.AUTOCOMPACT_BUFFER +
		mcpTokens
	);
}

export function getContextFromInput(
	input: HookInput,
	_estimateOverhead: boolean = false,
	_overheadTokens?: number,
): ContextResult {
	const contextWindow = input.context_window;

	if (!contextWindow) {
		return { tokens: 0, maxTokens: TOKEN_LIMITS.CONTEXT_WINDOW, percentage: 0 };
	}

	const windowSize = contextWindow.context_window_size || TOKEN_LIMITS.CONTEXT_WINDOW;
	// Espace utilisable = taille totale - buffer autocompact (16.5%)
	const usableSpace = windowSize - OVERHEAD_ESTIMATION.AUTOCOMPACT_BUFFER;

	// Use the precomputed used_percentage from Codex when available.
	// Sinon fallback sur le calcul manuel
	// @see https://code.codex.com/docs/en/statusline
	if (contextWindow.used_percentage !== undefined) {
		const tokens = Math.round((contextWindow.used_percentage / 100) * windowSize);
		const percentage = Math.min((tokens / usableSpace) * 100, 100);
		return { tokens, maxTokens: usableSpace, percentage };
	}

	// Fallback: calculate from totals, which is less precise because compacted tokens are included.
	const totalTokens = contextWindow.total_input_tokens + contextWindow.total_output_tokens;
	const percentage = Math.min((totalTokens / usableSpace) * 100, 100);

	return { tokens: totalTokens, maxTokens: usableSpace, percentage };
}
