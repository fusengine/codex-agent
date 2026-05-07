/**
 * Limits Segment - deprecated legacy remote usage surface
 *
 * @description Kept for config compatibility; disabled for Codex.
 */

import type { StatuslineConfig } from "../config/schema";
import type { ISegment, SegmentContext } from "../interfaces";

export class LimitsSegment implements ISegment {
	readonly name = "limits";
	readonly priority = 55;

	isEnabled(config: StatuslineConfig): boolean {
		void config;
		return false;
	}

	async render(_context: SegmentContext, config: StatuslineConfig): Promise<string> {
		void config;
		return "";
	}
}
