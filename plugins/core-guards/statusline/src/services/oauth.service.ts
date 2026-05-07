/**
 * OAuth Service - disabled compatibility shim
 *
 * @description Legacy remote usage fetching is not available for Codex.
 */

import type { OAuthUsageResponse } from "../interfaces/oauth-usage.interface";

export { getErrorCooldownLeft, getLastFailReason } from "./error-state";
export type { OAuthFailReason } from "./oauth-fetch";
export { formatUsage } from "./oauth-formatter";

/**
 * Returns null so the statusline never starts legacy remote usage fetching.
 * @returns null
 */
export async function getUsageLimits(): Promise<OAuthUsageResponse | null> {
	return null;
}
