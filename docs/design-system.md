# Kinetic Professional — Design System

## Color Layers

The palette is organized into three semantic layers, each with light and dark mode
pairs defined as CSS custom properties in `src/routes/layout.css`.

**Surfaces** — purple-tinted neutrals that create depth without hard borders.
`background` is the page canvas, `card` floats above it, `secondary` is a low-contrast
inset, `muted` and `accent` provide progressively stronger tints for UI controls.

**Job Role (primary)** — deep purple (`hsl 249 85% 44%` light / `hsl 249 80% 88%`
dark). Used for primary CTAs, headings that identify job context, active tab states,
and the gradient button (`from-primary to-primary-container`). `primary-fixed` is a
very pale tint for selected-state backgrounds.

**User Skill — flame & warmth** — `flame` (orange, `hsl 14 100% 57%`) represents
individual skills and high-intensity states; `warmth` (gold, `hsl 45 100% 49%`)
represents proficiency and medium-heat feedback. Each has `muted` and `subtle`
variants for backgrounds and badges.

## Typography

The typeface is **Inter** (loaded from Google Fonts in `app.html`). Five editorial
utility classes are defined as `@utility` in `layout.css`:

| Utility            | Size     | Weight | Use case                      |
| ------------------ | -------- | ------ | ----------------------------- |
| `text-display-lg`  | 3.5 rem  | 900    | Hero / splash headings        |
| `text-headline-md` | 1.75rem  | 700    | Page titles                   |
| `text-title-lg`    | 1.25rem  | 600    | Section headings, card titles |
| `text-body-md`     | 0.875rem | 400    | Paragraph / description text  |
| `text-label-md`    | 0.75rem  | 500    | Overline labels, metadata     |

Use standard Tailwind `text-sm`, `text-xs`, etc. for anything that doesn't map cleanly
to the scale.

## Surfaces & Layering

Boundaries are expressed through **tonal shifts**, not borders.

- Cards use `bg-card rounded-xl shadow-ambient` on the page `bg-background`.
- Inset sections use `bg-secondary` only when anchored by a visible heading or label
  (e.g. the "Selected Skills" tray on the create-job page). Avoid wrapping card lists
  in an extra secondary layer — the ambient shadow provides enough separation.
- Inputs use `bg-accent` with `border-input/15` (ghost border) so they read as a
  subtle field on the card surface.
- The base radius is `0.75rem`; cards and containers use `rounded-xl`.

## Component Patterns

**Button** — default variant is a gradient (`from-primary to-primary-container`).
`flame` variant uses the flame gradient. `ghost`, `outline`, `secondary`, and
`destructive` behave as standard shadcn variants.

**Badge** — includes `flame`, `flame-subtle`, `warmth`, and `warmth-subtle` variants
alongside the standard set. Entity-type badges map to these semantically (Job →
`primary-fixed`, Skill → `flame-subtle`, Occupation → `warmth-subtle`).

**Input / Textarea** — ghost-border style: `bg-accent`, `border-input/15`, focus
reveals `bg-background` + `border-primary/50` + ring.

**Card** — borderless by default (`shadow-ambient` only). Hover can shift to
`bg-secondary`.

## Responsive Approach

Use **container queries** (`@md:`, `@lg:`, `@4xl:`, etc.) instead of viewport media
queries. This keeps components responsive to their parent rather than the window.

## Dark Mode

Dark mode is activated via `.dark` class on the root element. Every custom property has
a dark counterpart. Key differences: primary inverts to a pale lavender, flame stays
vibrant, surfaces shift to very dark purple-grey tones, and `shadow-ambient` becomes
nearly invisible (fine — dark surfaces provide their own contrast).
