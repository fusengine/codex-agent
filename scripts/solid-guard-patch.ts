const CODE_EXTENSIONS = new Set([
	".ts",
	".tsx",
	".js",
	".jsx",
	".py",
	".php",
	".swift",
	".go",
	".rs",
	".rb",
	".java",
	".vue",
	".svelte",
	".astro",
]);

const COMPONENT_EXTENSIONS = new Set([".tsx", ".jsx", ".vue", ".svelte"]);

type ToolInput = {
	command?: string;
	content?: string;
	file_path?: string;
	new_string?: string;
	path?: string;
};

function extension(path: string): string {
	const match = path.match(/\.[A-Za-z0-9]+$/);
	return match?.[0] ?? "";
}

function patchPaths(patchText: string): string[] {
	const paths = new Set<string>();
	const patterns = [
		/^\*\*\* Add File:\s+(.+)$/gm,
		/^\*\*\* Update File:\s+(.+)$/gm,
		/^\+\+\+\s+b\/(.+)$/gm,
	];
	for (const pattern of patterns) {
		for (const match of patchText.matchAll(pattern)) {
			const path = match[1]?.trim();
			if (path) paths.add(path);
		}
	}
	return [...paths];
}

export function codePatchPaths(patchText: string, input: ToolInput = {}): string[] {
	const paths = new Set(patchPaths(patchText));
	for (const path of [input.file_path, input.path]) {
		if (path) paths.add(path);
	}
	return [...paths].filter((path) => CODE_EXTENSIONS.has(extension(path)));
}

export function hasInlineTypesInComponent(path: string, patchText: string): boolean {
	if (!COMPONENT_EXTENSIONS.has(extension(path))) return false;
	const addedLines = patchText
		.split(/\r?\n/)
		.filter((line) => line.startsWith("+") && !line.startsWith("+++"))
		.map((line) => line.slice(1));
	return addedLines.some((line) => /^\s*(export\s+)?(interface|type)\s+\w+/.test(line));
}

export function structuredInlineTypes(path: string, input: ToolInput = {}): boolean {
	if (!COMPONENT_EXTENSIONS.has(extension(path))) return false;
	const text = [input.content, input.new_string].filter(Boolean).join("\n");
	return text.split(/\r?\n/).some((line) => /^\s*(export\s+)?(interface|type)\s+\w+/.test(line));
}

export async function countLines(path: string): Promise<number | null> {
	try {
		const text = await Bun.file(path).text();
		return text.split(/\r?\n/).length;
	} catch {
		return null;
	}
}
