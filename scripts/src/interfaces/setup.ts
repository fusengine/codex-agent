/**
 * Setup interfaces
 */

/** Paths configuration for setup process */
export interface SetupPaths {
	settings: string;
	marketplace: string;
	loaderSrc: string;
	scriptDir: string;
	codexMdSrc: string;
	codexMdDest: string;
}

/** Runtime setup options */
export interface SetupOptions {
	skipEnv: boolean;
	nonInteractive: boolean;
}
