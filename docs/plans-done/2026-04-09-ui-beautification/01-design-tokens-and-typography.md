# Phase 1: Design Tokens & Typography Foundation

## Scope

Replace the shadcn zinc palette with the Kinetic Professional color system in `layout.css`,
load Inter from Google Fonts, define the editorial type scale, and bump the base radius.
This phase touches only `layout.css` and `app.html` — no component changes yet.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- All tokens live in `src/routes/layout.css` via CSS variables + `@theme inline`.
- No raw hex in components — always use semantic token classes.
- Group tokens by conceptual layer in comments: Surfaces, Job Role (Primary), User Skill (Flame/Warmth), Typography.

## Implementation Details

### 1. Load Inter from Google Fonts

In `src/app.html`, add the Google Fonts link in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
	rel="stylesheet"
/>
```

### 2. Update `layout.css` — Light palette (`:root`)

Replace the existing `:root` block with:

```css
:root {
	/* ── Surfaces ── */
	--background: hsl(270 100% 99%); /* #fcf8ff */
	--foreground: hsl(249 17% 12%); /* #1b1b24 */
	--card: hsl(0 0% 100%); /* #ffffff — surface-container-lowest */
	--card-foreground: hsl(249 17% 12%);
	--popover: hsl(0 0% 100%);
	--popover-foreground: hsl(249 17% 12%);
	--secondary: hsl(260 100% 97%); /* #f6f2ff — surface-container-low */
	--secondary-foreground: hsl(249 17% 12%);
	--muted: hsl(256 46% 96%); /* #f0ecfa — surface-container */
	--muted-foreground: hsl(252 10% 30%); /* #474555 — on-surface-variant */
	--accent: hsl(256 32% 93%); /* #eae6f4 — surface-container-high */
	--accent-foreground: hsl(249 17% 12%);

	/* ── Job Role Layer (Primary — Deep Purple) ── */
	--primary: hsl(249 85% 44%); /* #3211cd */
	--primary-foreground: hsl(0 0% 100%);
	--primary-container: hsl(249 75% 56%); /* #4c3ae3 — gradient endpoint */
	--primary-fixed: hsl(249 73% 94%); /* #e3dfff — light purple tint */

	/* ── User Skill Layer (Flame) ── */
	--flame: hsl(14 100% 57%); /* #ff5722 */
	--flame-foreground: hsl(0 0% 100%);
	--flame-muted: hsl(14 100% 82%); /* #ffb5a0 */
	--flame-subtle: hsl(14 100% 91%); /* #ffdbd1 */

	/* ── User Skill Layer (Warmth) ── */
	--warmth: hsl(45 100% 49%); /* #fabd00 */
	--warmth-subtle: hsl(42 100% 81%); /* #ffdf9e */

	/* ── Functional ── */
	--destructive: hsl(0 73% 41%); /* #ba1a1a */
	--destructive-foreground: hsl(0 0% 100%);
	--border: hsl(256 15% 81%); /* #c8c4d8 — outline-variant */
	--input: hsl(256 15% 81%);
	--ring: hsl(249 85% 44%); /* matches primary */

	/* ── Charts ── */
	--chart-1: hsl(249 85% 44%);
	--chart-2: hsl(14 100% 57%);
	--chart-3: hsl(45 100% 49%);
	--chart-4: hsl(249 75% 56%);
	--chart-5: hsl(14 100% 82%);

	/* ── Radius ── */
	--radius: 0.75rem;
}
```

### 3. Update `layout.css` — Dark palette (`.dark`)

Replace the existing `.dark` block with:

```css
.dark {
	/* ── Surfaces ── */
	--background: hsl(260 30% 6%);
	--foreground: hsl(256 46% 96%); /* #f3effd */
	--card: hsl(260 20% 10%);
	--card-foreground: hsl(256 46% 96%);
	--popover: hsl(260 20% 10%);
	--popover-foreground: hsl(256 46% 96%);
	--secondary: hsl(260 15% 15%);
	--secondary-foreground: hsl(256 46% 96%);
	--muted: hsl(260 12% 18%);
	--muted-foreground: hsl(260 10% 65%);
	--accent: hsl(260 15% 20%);
	--accent-foreground: hsl(256 46% 96%);

	/* ── Job Role Layer (Primary — lightened for dark-bg contrast) ── */
	--primary: hsl(249 80% 88%); /* ~#c4c0ff — inverse-primary */
	--primary-foreground: hsl(249 17% 12%);
	--primary-container: hsl(249 65% 68%); /* ~#7c6bf0 */
	--primary-fixed: hsl(249 30% 20%);

	/* ── User Skill Layer (Flame — stays bold on dark) ── */
	--flame: hsl(14 100% 57%); /* stays #ff5722 */
	--flame-foreground: hsl(0 0% 100%);
	--flame-muted: hsl(14 100% 82%);
	--flame-subtle: hsl(14 40% 18%);

	/* ── User Skill Layer (Warmth — stays bold on dark) ── */
	--warmth: hsl(45 100% 49%);
	--warmth-subtle: hsl(42 40% 18%);

	/* ── Functional ── */
	--destructive: hsl(0 62.8% 30.6%);
	--destructive-foreground: hsl(0 0% 98%);
	--border: hsl(260 10% 20%);
	--input: hsl(260 10% 20%);
	--ring: hsl(249 80% 88%);

	/* ── Charts ── */
	--chart-1: hsl(249 80% 88%);
	--chart-2: hsl(14 100% 57%);
	--chart-3: hsl(45 100% 49%);
	--chart-4: hsl(249 65% 68%);
	--chart-5: hsl(14 100% 82%);
}
```

### 4. Update `@theme inline` block

Add the new tokens alongside existing ones:

```css
@theme inline {
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);

	/* Standard shadcn mappings */
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-destructive-foreground: var(--destructive-foreground);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-chart-1: var(--chart-1);
	--color-chart-2: var(--chart-2);
	--color-chart-3: var(--chart-3);
	--color-chart-4: var(--chart-4);
	--color-chart-5: var(--chart-5);

	/* Extended tokens — Job Role Layer */
	--color-primary-container: var(--primary-container);
	--color-primary-fixed: var(--primary-fixed);

	/* Extended tokens — User Skill Layer (Flame) */
	--color-flame: var(--flame);
	--color-flame-foreground: var(--flame-foreground);
	--color-flame-muted: var(--flame-muted);
	--color-flame-subtle: var(--flame-subtle);

	/* Extended tokens — User Skill Layer (Warmth) */
	--color-warmth: var(--warmth);
	--color-warmth-subtle: var(--warmth-subtle);

	/* Font family */
	--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}
```

### 5. Typography scale

Add after the `@theme inline` block:

```css
@utility text-display-lg {
	font-size: 3.5rem;
	line-height: 1.1;
	letter-spacing: -0.02em;
	font-weight: 900;
}

@utility text-headline-md {
	font-size: 1.75rem;
	line-height: 1.3;
	letter-spacing: -0.01em;
	font-weight: 700;
}

@utility text-title-lg {
	font-size: 1.25rem;
	line-height: 1.4;
	font-weight: 600;
}

@utility text-body-md {
	font-size: 0.875rem;
	line-height: 1.5;
	font-weight: 400;
}

@utility text-label-md {
	font-size: 0.75rem;
	line-height: 1.4;
	letter-spacing: 0.05em;
	font-weight: 500;
}
```

### 6. Ambient shadow utility

Add a reusable utility for the design system's ambient shadow:

```css
@utility shadow-ambient {
	box-shadow: 0 12px 32px rgba(71, 69, 85, 0.06);
}
```

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Visually confirm in the browser or Storybook that:

- Light mode shows purple-tinted surfaces and deep purple primary
- Dark mode shows dark purple backgrounds with lightened primary
- Existing components still render (they'll still use the same token class names, just new values)
