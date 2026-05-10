# Sector palette — Creative / Studio

Bold, expressive, opinionated. Magenta / yellow / cyan as a committed primary triad. High chroma is the point — the design should feel like an editorial cover, not a SaaS dashboard. Whitespace is loud. Type does the heavy lifting.

## OKLCH tokens (light)

```css
--bg:           oklch(0.99 0.005 90);
--surface:     oklch(0.96 0.010 90);
--border:      oklch(0.88 0.015 85);
--text:        oklch(0.16 0.020 280);
--text-muted:  oklch(0.50 0.025 280);

--brand:       oklch(0.62 0.270 340);   /* magenta — primary */
--accent-1:    oklch(0.85 0.180 95);    /* committed yellow */
--accent-2:    oklch(0.75 0.150 215);   /* cyan */

--success:     oklch(0.65 0.180 145);
--warning:     oklch(0.80 0.180 75);
--danger:      oklch(0.58 0.220 25);
```

## OKLCH tokens (dark)

```css
--bg:           oklch(0.12 0.020 280);
--surface:     oklch(0.18 0.025 285);
--border:      oklch(0.30 0.040 290);
--text:        oklch(0.98 0.015 90);
--text-muted:  oklch(0.74 0.025 90);

--brand:       oklch(0.74 0.260 340);
--accent-1:    oklch(0.90 0.180 95);
--accent-2:    oklch(0.80 0.160 215);
--success:     oklch(0.76 0.180 145);
--warning:     oklch(0.86 0.180 75);
--danger:      oklch(0.70 0.220 25);
```

## Typography pair

- Display: **PP Editorial New**, **Druk**, **GT Sectra**, **Migra**, or **Domaine Display** — must carry visual weight on its own.
- Body: **GT America**, **Söhne**, or **Untitled Sans** — neutral counterweight to the display face.
- Optional accent: a stencil, mono, or display oddity for one-off moments (never as body).
- Forbidden: Inter, Roboto, Arial, Open Sans, Helvetica Neue without weight contrast.

## Spacing & motion

- Base unit: 8px. Scale: 8 / 16 / 24 / 32 / 48 / 72 / 96 / 144 / 192. Generous whitespace is identity.
- Border radius: 0 (sharp editorial) OR 999px (full pill). No middle ground except inputs at 6px.
- Motion: 300–500ms with deliberate spring (stiffness 180, damping 22). Hover transforms are bold (scale 1.02–1.04, slight rotate or translateY).

## Forbidden

- Tame, balanced layouts with everything centered.
- AI-default purple-pink gradients (pick a real palette).
- Emoji as illustration substitute.
- Generic stock photography.
- Inter / Roboto on a creative studio site is a violation.
