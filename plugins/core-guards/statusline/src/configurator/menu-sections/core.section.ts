/**
 * Core Menu Sections - Codex, Model, Context, Cost
 *
 * @description SRP: Core segment menu options only
 */

import type { StatuslineConfig } from "../../config/schema";
import { chk, getStyleIcon } from "../menu-helpers";
import type { MenuOption } from "../menu-options";

/**
 * Build Codex section options
 */
export function buildCodexSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.codex", label: "─── ◆ CODEX ───", hint: "" },
		{
			value: "codex.enabled",
			label: `  ${chk(config.codex.enabled)} Enable Codex segment`,
			hint: "",
		},
		{
			value: "codex.version",
			label: `    ${chk(config.codex.showVersion)} └─ Show version`,
			hint: "",
		},
	];
}

/**
 * Build Model section options
 */
export function buildModelSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.model", label: "─── ⚙ MODEL ───", hint: "" },
		{
			value: "model.enabled",
			label: `  ${chk(config.model.enabled)} Enable model segment`,
			hint: "",
		},
		{
			value: "model.tokens",
			label: `    ${chk(config.model.showTokens)} └─ Show tokens`,
			hint: "",
		},
		{
			value: "model.maxTokens",
			label: `    ${chk(config.model.showMaxTokens)} └─ Show max tokens (172K/200K)`,
			hint: "",
		},
	];
}

/**
 * Build Context section options
 */
export function buildContextSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.context", label: "─── ▦ CONTEXT ───", hint: "" },
		{
			value: "context.enabled",
			label: `  ${chk(config.context.enabled)} Enable context segment`,
			hint: "",
		},
		{
			value: "context.progressBar",
			label: `    ${chk(config.context.progressBar.enabled)} └─ Progress bar`,
			hint: "",
		},
		{
			value: "context.progressBar.style",
			label: `      └─ Style: ${getStyleIcon(config.context.progressBar.style)}`,
			hint: "",
		},
	];
}

/**
 * Build Cost section options
 */
export function buildCostSection(config: StatuslineConfig): MenuOption[] {
	return [
		{ value: "header.cost", label: "─── $ COST ───", hint: "" },
		{
			value: "cost.enabled",
			label: `  ${chk(config.cost.enabled)} Enable cost display`,
			hint: "",
		},
	];
}
