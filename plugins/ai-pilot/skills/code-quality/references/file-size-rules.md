---
name: file-size-rules
description: File size limits, LoC calculation, and split strategies for code quality
when-to-use: Checking file sizes, splitting large files
keywords: file size, LoC, lines of code, split, refactor
priority: high
related: solid-validation.md, architecture-patterns.md
---

# File Size Rules

## Limits

| Metric | Limit | Action |
|--------|-------|--------|
| **LoC** (code only) | < 100 | ✅ OK |
| **LoC** >= 100, **Total** < 200 | | ✅ OK (well-documented) |
| **Total** >= 200 | | ❌ SPLIT required |

## Enforced Extensions

The PostToolUse hook `enforce-file-size.py` validates these extensions:

`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.java`, `.php`, `.cpp`, `.c`, `.rb`, `.swift`, `.kt`, `.dart`, `.vue`, `.svelte`, `.astro`

**Not enforced** (intentional): `.html`, `.htm`, `.css`, `.scss`, `.md`, `.json`, `.yaml`, `.toml`, `.sql`, `.sh`. Markup, style, and data files often legitimately exceed 100 lines (design previews, design tokens, utility classes, structured data). HTML is intentionally excluded — design outputs (Gemini Design MCP, single-page mockups) and static templates regularly run hundreds of lines without being a code-quality issue.

## LoC Calculation

```
LoC = Total lines - Comment lines - Blank lines

Comment patterns:
- JS/TS: //, /* */, /** */
- Python: #, """ """, ''' '''
- Go: //, /* */
- PHP: //, #, /* */
- Rust: //, /* */, ///
```

## Split Strategy

```
component.tsx (150 lines) → SPLIT INTO:
├── Component.tsx (40 lines) - orchestrator
├── ComponentHeader.tsx (30 lines)
├── ComponentContent.tsx (35 lines)
├── useComponentLogic.ts (45 lines) - hook
└── index.ts (5 lines) - barrel export
```
