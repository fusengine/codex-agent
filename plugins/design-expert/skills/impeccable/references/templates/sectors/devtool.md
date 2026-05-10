# Sector palette — Devtool

Monochromatic foundation with a single committed accent. Built for long sessions, syntax-heavy surfaces, and dense terminal-adjacent layouts. The accent carries everything: brand, primary CTA, focus, semantic highlight. Restraint is the brand.

## OKLCH tokens (light)

```css
--bg:           oklch(0.99 0.002 270);
--surface:     oklch(0.97 0.004 270);
--border:      oklch(0.90 0.006 270);
--text:        oklch(0.20 0.010 270);
--text-muted:  oklch(0.52 0.012 270);

--brand:       oklch(0.55 0.220 270);   /* electric violet — pick ONE: violet OR cyan */
--brand-deep:  oklch(0.42 0.240 275);
--accent:      var(--brand);

--success:     oklch(0.62 0.130 155);
--warning:     oklch(0.78 0.140 80);
--danger:      oklch(0.58 0.190 25);
```

## OKLCH tokens (dark)

```css
--bg:           oklch(0.13 0.005 270);
--surface:     oklch(0.17 0.008 270);
--border:      oklch(0.26 0.010 270);
--text:        oklch(0.97 0.005 270);
--text-muted:  oklch(0.68 0.012 270);

--brand:       oklch(0.72 0.220 270);
--brand-deep:  oklch(0.62 0.240 275);
--accent:      var(--brand);
--success:     oklch(0.74 0.140 155);
--warning:     oklch(0.84 0.140 80);
--danger:      oklch(0.70 0.190 25);
```

Alt accent (pick exactly one for the project — never both):
```css
/* Electric blue */
--brand: oklch(0.62 0.230 240);
```

## Typography pair

- Display: **Söhne**, **GT America Mono**, **Berkeley Mono**, or **JetBrains Mono** for hero numerals.
- Body: **Söhne**, **Inter Tight**, **GT America**.
- Mono: **JetBrains Mono**, **Berkeley Mono**, **IBM Plex Mono**, or **Geist Mono**. Used everywhere code, ports, IDs, hashes appear.
- Forbidden: Inter (default cuts), Roboto, Arial, Open Sans, Source Code Pro.

## Spacing & motion

- Base unit: 4px. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Border radius: 4px (inputs, code blocks), 8px (cards), 12px (modals). Tight, technical.
- Motion: 100–150ms linear or ease-out. No springs. Devtools must feel instant, not playful.

## Forbidden

- Multi-hue gradients (kills the monochromatic identity).
- Glass-morphism on code surfaces.
- Emoji icons in CLI flow or status indicators.
- Lifestyle photography.
- Two competing accents — pick one.
