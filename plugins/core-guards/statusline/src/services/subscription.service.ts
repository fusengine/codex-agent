/**
 * Subscription Service - Plan detection and token limits
 *
 * @description SRP: Subscription detection only
 */

import { TOKEN_LIMITS } from "../constants";
import type { SubscriptionType } from "../interfaces";

interface SessionRecord {
	modelId?: string;
}

/**
 * Detect the user's subscription plan based on model usage
 * @param modelId - Current model identifier
 * @param sessions - Historical session records
 * @param configPlan - Optional plan override from config
 * @returns Detected subscription type
 */
export function detectSubscription(
	modelId: string,
	sessions: SessionRecord[],
	configPlan?: SubscriptionType,
): SubscriptionType {
	if (configPlan) return configPlan;

	if (modelId.includes("max")) return "max";

	const hasUsedPremium = sessions.some((s) => s.modelId?.includes("max"));
	if (hasUsedPremium) return "max";

	return "pro";
}

/**
 * Get maximum token allowance for a subscription plan
 * @param subscription - The subscription type
 * @returns Maximum tokens per 5-hour window
 */
export function getMaxTokens(subscription: SubscriptionType): number {
	switch (subscription) {
		case "free":
			return TOKEN_LIMITS.FREE.MAX_PER_5_HOURS;
		case "pro":
			return TOKEN_LIMITS.PRO.MAX_PER_5_HOURS;
		case "max":
			return TOKEN_LIMITS.MAX.MAX_PER_5_HOURS;
	}
}
