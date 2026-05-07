/**
 * Legacy usage interfaces for compatibility.
 *
 * @description Types for legacy remote usage data.
 */

/**
 * Legacy credentials stored in macOS Keychain.
 */
export interface OAuthCredentials {
	codexAiOauth: {
		accessToken: string;
		refreshToken: string;
		expiresAt: number;
		scopes?: string[];
	};
}

/**
 * Individual usage limit.
 */
export interface UsageLimit {
	/** Utilization percentage (0.0 - 1.0). */
	utilization: number;
	/** ISO timestamp for the next reset. */
	resets_at: string | null;
}

/**
 * Extra usage data.
 */
export interface ExtraUsageLimits {
	is_enabled: boolean;
	monthly_limit: number;
	used_credits: number;
	utilization: number;
}

/**
 * Legacy remote usage response.
 */
export interface OAuthUsageResponse {
	/** Rolling 5-hour limit. */
	five_hour: UsageLimit;
	/** Weekly limit across all models. */
	seven_day: UsageLimit;
	/** Weekly high-tier limit. */
	seven_day_opus: UsageLimit;
	/** Legacy app limit (nullable). */
	seven_day_oauth_apps?: UsageLimit | null;
	/** Extra usage / overage billing (nullable) */
	extra_usage?: ExtraUsageLimits | null;
}

/**
 * Formatted usage for display.
 */
export interface FormattedUsage {
	fiveHour: {
		percentage: number;
		resetsAt: Date | null;
		timeLeft: number;
	};
	sevenDay: {
		percentage: number;
		resetsAt: Date | null;
		timeLeft: number;
	};
	opus: {
		percentage: number;
		resetsAt: Date | null;
	};
}
