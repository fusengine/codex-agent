/**
 * OAuth Constants - disabled compatibility values
 *
 * @description Legacy remote usage fetching is not available for Codex.
 */

/** Empty URL keeps legacy fetch code inert if called directly. */
export const OAUTH_API_URL = "";

/** Service name in macOS Keychain. */
export const KEYCHAIN_SERVICE = "Codex-credentials";

/** Detect Codex version dynamically */
function getCodexVersion(): string {
	try {
		const proc = Bun.spawnSync(["codex", "--version"]);
		const raw = proc.stdout.toString().trim();
		const match = raw.match(/^(\d+\.\d+\.\d+)/);
		return match ? match[1] : "2.1.69";
	} catch {
		return "2.1.69";
	}
}

/** Headers for legacy usage fetches. */
export const OAUTH_HEADERS = {
	Accept: "application/json",
	"User-Agent": `codex/${getCodexVersion()}`,
} as const;

/** Successful cache TTL in milliseconds (2 minutes). */
export const CACHE_TTL_MS = 120_000;

/** Error cache TTL in milliseconds (2 minutes). */
export const ERROR_CACHE_TTL_MS = 120_000;
