/**
 * Menu Options - Assembles all menu sections
 *
 * @description SRP: Only responsible for assembling menu sections
 */

import type { StatuslineConfig } from "../config/schema";
import {
	buildCodexSection,
	buildContextSection,
	buildCostSection,
	buildDailySection,
	buildDirectorySection,
	buildExtrasSection,
	buildFiveHourSection,
	buildGlobalSection,
	buildModelSection,
	buildWeeklySection,
} from "./menu-sections";

/**
 * Menu option structure
 */
export interface MenuOption {
	value: string;
	label: string;
	hint: string;
}

/**
 * Builds the complete menu options array for multiselect
 */
export function buildMenuOptions(config: StatuslineConfig): MenuOption[] {
	return [
		...buildCodexSection(config),
		...buildModelSection(config),
		...buildContextSection(config),
		...buildCostSection(config),
		...buildFiveHourSection(config),
		...buildWeeklySection(config),
		...buildDirectorySection(config),
		...buildDailySection(config),
		...buildGlobalSection(config),
		...buildExtrasSection(config),
	];
}
