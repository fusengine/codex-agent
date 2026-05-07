/**
 * Extras Menu Sections - Directory, Daily, Global, Node, Edits
 */

import type { StatuslineConfig } from "../../config/schema";
import { chk, getSeparatorDisplay } from "../menu-helpers";
import type { MenuOption } from "../menu-options";

/** Build Directory/Git section options */
export function buildDirectorySection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.directory", label: "─── ⌂ DIRECTORY/GIT ───", hint: "" },
		{
			value: "directory.enabled",
			label: `  ${chk(config.directory.enabled)} Enable directory segment`,
			hint: "",
		},
		{
			value: "directory.git",
			label: `    ${chk(config.directory.showGit)} └─ Show git info`,
			hint: "",
		},
		{
			value: "directory.branch",
			label: `    ${chk(config.directory.showBranch)} └─ Show branch`,
			hint: "",
		},
		{
			value: "directory.dirty",
			label: `    ${chk(config.directory.showDirtyIndicator)} └─ Dirty indicator (*)`,
			hint: "",
		},
		{
			value: "directory.staged",
			label: `    ${chk(config.directory.showStagedCount)} └─ Staged files count`,
			hint: "",
		},
		{
			value: "directory.unstaged",
			label: `    ${chk(config.directory.showUnstagedCount)} └─ Unstaged files count`,
			hint: "",
		},
	];
}

/** Build Daily Spend section options */
export function buildDailySection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.daily", label: "─── $ DAILY SPEND ───", hint: "" },
		{
			value: "daily.enabled",
			label: `  ${chk(config.dailySpend.enabled)} Enable daily spend`,
			hint: "",
		},
		{
			value: "daily.budget",
			label: `    ${chk(config.dailySpend.showBudget)} └─ Show budget`,
			hint: "",
		},
	];
}

/** Build Global section options */
export function buildGlobalSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.global", label: "─── ◇ GLOBAL ───", hint: "" },
		{
			value: "global.labels",
			label: `  ${chk(config.global.showLabels)} ◇ Show labels`,
			hint: "",
		},
		{
			value: "global.separator",
			label: `  │ Separator: ${getSeparatorDisplay(config.global.separator)}`,
			hint: "",
		},
		{
			value: "global.compact",
			label: `  ${chk(config.global.compactMode)} ▣ Compact mode`,
			hint: "",
		},
	];
}

/** Build Extras section options (Node, Edits) */
export function buildExtrasSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.extras", label: "─── ⬢ EXTRAS ───", hint: "" },
		{ value: "node.enabled", label: `  ${chk(config.node.enabled)} ⬢ Node version`, hint: "" },
		{ value: "edits.enabled", label: `  ${chk(config.edits.enabled)} ± Edits count`, hint: "" },
	];
}
