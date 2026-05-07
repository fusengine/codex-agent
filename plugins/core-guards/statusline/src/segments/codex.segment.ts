/**
 * Codex Segment - Displays the Codex version
 *
 * @description SRP: Affichage version Codex uniquement
 */

import type { StatuslineConfig } from "../config/schema";
import type { ISegment, SegmentContext } from "../interfaces";
import { colors } from "../utils";

export class CodexSegment implements ISegment {
	readonly name = "codex";
	readonly priority = 10;

	isEnabled(config: StatuslineConfig): boolean {
		return config.codex.enabled;
	}

	async render(context: SegmentContext, config: StatuslineConfig): Promise<string> {
		const { icons, global } = config;
		const version = context.input.version || "N/A";
		const label = global.showLabels ? " Codex:" : "";

		return `${colors.blue(icons.codex)}${colors.blue(label)} ${version}`;
	}
}
