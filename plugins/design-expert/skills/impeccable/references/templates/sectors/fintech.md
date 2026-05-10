# Sector palette — Fintech

Restrained, trustworthy, technical. Cool blues / teals dominate. Chroma is held back to read as institutional, not playful. Reserve the brightest accent for capital-flow CTAs (transfer, invest, confirm).

## OKLCH tokens (light)

```css
--bg:           oklch(0.99 0.005 240);
--surface:     oklch(0.97 0.010 235);
--border:      oklch(0.92 0.015 230);
--text:        oklch(0.22 0.030 245);
--text-muted:  oklch(0.50 0.025 240);

--brand:       oklch(0.55 0.140 235);  /* primary cool blue */
--brand-deep:  oklch(0.42 0.150 240);
--accent:      oklch(0.68 0.130 195);  /* teal — secondary action */

--success:     oklch(0.62 0.140 155);
--warning:     oklch(0.78 0.140 80);
--danger:      oklch(0.58 0.180 25);
```

## OKLCH tokens (dark)

```css
--bg:           oklch(0.16 0.020 245);
--surface:     oklch(0.20 0.025 240);
--border:      oklch(0.28 0.030 235);
--text:        oklch(0.96 0.010 240);
--text-muted:  oklch(0.70 0.020 240);

--brand:       oklch(0.72 0.150 230);
--brand-deep:  oklch(0.62 0.160 235);
--accent:      oklch(0.78 0.120 195);
--success:     oklch(0.74 0.140 155);
--warning:     oklch(0.84 0.140 80);
--danger:      oklch(0.70 0.180 25);
```

## Typography pair

- Display: **Inter Tight** or **Söhne** — geometric, no flourish.
- Body: **IBM Plex Sans** or **Söhne** — high legibility for tabular data.
- Mono (numerals, balances): **JetBrains Mono** or **IBM Plex Mono**, tabular-nums enforced.
- Forbidden: Inter (default), Roboto, Arial, Open Sans, Comic Sans, Helvetica Neue without weight discipline.

## Spacing & motion

- Base unit: 4px. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Border radius: 6px (inputs), 10px (cards), 16px (modals). No fully rounded buttons.
- Motion: 120–180ms ease-out for state changes. Avoid bouncy springs; capital flow must feel deterministic.

## Forbidden

- Purple-to-pink gradients, neon, holographic.
- Emoji used as icons in financial primitives.
- Tabular numerics in proportional fonts.
- Skeuomorphic shadows on currency cards.
