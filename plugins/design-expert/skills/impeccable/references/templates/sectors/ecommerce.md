# Sector palette — Ecommerce

Warm, appetitive, decisive. Chroma is committed — color is a conversion lever, not decoration. Strong CTA contrast against neutral product canvas. Sale / urgency palette held in reserve and used sparingly to keep impact.

## OKLCH tokens (light)

```css
--bg:           oklch(0.99 0.006 60);
--surface:     oklch(0.97 0.012 55);
--border:      oklch(0.90 0.020 50);
--text:        oklch(0.22 0.025 40);
--text-muted:  oklch(0.52 0.030 45);

--brand:       oklch(0.62 0.190 35);   /* warm orange — primary CTA */
--brand-deep:  oklch(0.50 0.200 30);
--accent:      oklch(0.55 0.220 18);   /* committed red — sale */

--success:     oklch(0.62 0.150 145);
--warning:     oklch(0.78 0.160 75);
--danger:      oklch(0.55 0.210 22);
```

## OKLCH tokens (dark)

```css
--bg:           oklch(0.17 0.020 35);
--surface:     oklch(0.21 0.025 40);
--border:      oklch(0.30 0.035 45);
--text:        oklch(0.97 0.015 50);
--text-muted:  oklch(0.72 0.025 45);

--brand:       oklch(0.74 0.180 40);
--brand-deep:  oklch(0.66 0.200 35);
--accent:      oklch(0.70 0.220 22);
--success:     oklch(0.74 0.150 145);
--warning:     oklch(0.85 0.160 75);
--danger:      oklch(0.70 0.210 22);
```

## Typography pair

- Display: **Fraunces**, **PP Editorial New**, or **Söhne Breit** — editorial serif or assertive grotesk for product hero.
- Body: **Söhne**, **GT America**, or **Inter Tight** — tight for catalog density.
- Forbidden: Inter, Roboto, Arial, Open Sans.

## Spacing & motion

- Base unit: 4px. Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 72 / 112.
- Border radius: 4px (inputs), 12px (product cards), 999px (pill CTAs and filters).
- Motion: 200–280ms with mild overshoot for "add to cart" success. Cart drawer uses spring (stiffness 220, damping 26).

## Forbidden

- Generic purple-pink gradients on product hero.
- Lifestyle stock photography filler.
- Centered everything on PLP.
- Emoji-only category icons.
- Glass-morphism overload on product cards.
