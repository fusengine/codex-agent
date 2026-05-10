# Sector palette — Health & Wellness

Calm, trustworthy, low-arousal. Muted greens and warm sands. Soft chroma. The design must reduce cognitive load — patients and clinicians arrive stressed, and the UI is not a place to express. Accessibility (WCAG AA minimum, AAA where text density allows) is the brand.

## OKLCH tokens (light)

```css
--bg:           oklch(0.99 0.006 95);
--surface:     oklch(0.97 0.012 100);
--border:      oklch(0.90 0.020 105);
--text:        oklch(0.22 0.025 150);
--text-muted:  oklch(0.50 0.025 150);

--brand:       oklch(0.55 0.090 155);   /* muted green — primary */
--brand-deep:  oklch(0.42 0.100 160);
--accent:      oklch(0.78 0.060 80);    /* warm sand */

--success:     oklch(0.60 0.130 150);
--warning:     oklch(0.78 0.120 75);
--danger:      oklch(0.55 0.150 25);    /* restrained — clinical alert, not marketing red */
```

## OKLCH tokens (dark)

```css
--bg:           oklch(0.16 0.015 155);
--surface:     oklch(0.20 0.020 155);
--border:      oklch(0.28 0.025 150);
--text:        oklch(0.96 0.012 100);
--text-muted:  oklch(0.72 0.020 110);

--brand:       oklch(0.72 0.110 155);
--brand-deep:  oklch(0.62 0.120 160);
--accent:      oklch(0.82 0.060 80);
--success:     oklch(0.74 0.130 150);
--warning:     oklch(0.84 0.120 75);
--danger:      oklch(0.70 0.150 25);
```

## Typography pair

- Display: **Söhne**, **GT America**, or **Untitled Sans** — humanist but not soft.
- Body: same family for cohesion. Larger base size (17–18px) for accessibility.
- Optional: a humanist serif (**Tiempos Text**, **Source Serif**) for long-form clinical content.
- Forbidden: Inter (default cuts), Roboto, Arial, Open Sans, Comic Sans.

## Spacing & motion

- Base unit: 4px, generous: 8 / 16 / 24 / 32 / 48 / 64 / 96.
- Border radius: 8px (inputs), 14px (cards), 20px (modals). Soft but not infantile.
- Motion: 200–280ms ease-out. No bounce, no spring. Reassurance, not excitement.

## Accessibility constraints (non-negotiable)

- Body text contrast ≥ 7:1 (AAA) where possible, never below 4.5:1.
- UI control contrast ≥ 3:1.
- Focus rings always visible, ≥ 2px, ≥ 3:1 against adjacent surfaces.
- No color-only signaling for clinical states — pair with icon + label.
- Touch targets ≥ 44px.

## Forbidden

- Saturated greens that read "freshness brand" instead of clinical.
- Purple-pink wellness-lifestyle gradients.
- Emoji for medical / clinical states.
- Glass-morphism on patient data surfaces.
- Sub-16px body text in patient-facing flows.
