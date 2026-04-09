# Phase 3: Color Palette Documentation Story

## Scope

Create a `ColorPalette` Storybook documentation component that displays all design tokens
organized by conceptual layer (Surfaces, Job Role, User Skill Flame, User Skill Warmth,
Functional), with swatches showing both light and dark mode values.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- Svelte 5 runes (`$props()`, `$derived()`).
- PascalCase component filenames.
- TSDoc for public props.
- Use semantic token classes — the palette swatches should reference the CSS variables
  directly so they auto-update with theme changes.

## Implementation Details

### 1. Create `src/lib/components/ui/color-palette/ColorPalette.svelte`

A documentation component that renders swatch groups. Each swatch shows:

- The color (as a filled rectangle using the CSS variable)
- The token name (e.g. `--primary`)
- The Tailwind class (e.g. `bg-primary`)

Structure:

```svelte
<script lang="ts">
	const surfaceTokens = [
		{
			name: 'background',
			class: 'bg-background',
			textClass: 'text-foreground',
			label: 'Background'
		},
		{ name: 'card', class: 'bg-card', textClass: 'text-card-foreground', label: 'Card' },
		{
			name: 'secondary',
			class: 'bg-secondary',
			textClass: 'text-secondary-foreground',
			label: 'Surface Low'
		},
		{ name: 'muted', class: 'bg-muted', textClass: 'text-muted-foreground', label: 'Surface' },
		{
			name: 'accent',
			class: 'bg-accent',
			textClass: 'text-accent-foreground',
			label: 'Surface High'
		}
	];

	const primaryTokens = [
		{
			name: 'primary',
			class: 'bg-primary',
			textClass: 'text-primary-foreground',
			label: 'Primary'
		},
		{
			name: 'primary-container',
			class: 'bg-primary-container',
			textClass: 'text-primary-foreground',
			label: 'Primary Container'
		},
		{
			name: 'primary-fixed',
			class: 'bg-primary-fixed',
			textClass: 'text-primary',
			label: 'Primary Fixed'
		}
	];

	const flameTokens = [
		{ name: 'flame', class: 'bg-flame', textClass: 'text-flame-foreground', label: 'Flame' },
		{
			name: 'flame-muted',
			class: 'bg-flame-muted',
			textClass: 'text-foreground',
			label: 'Flame Muted'
		},
		{
			name: 'flame-subtle',
			class: 'bg-flame-subtle',
			textClass: 'text-flame',
			label: 'Flame Subtle'
		}
	];

	const warmthTokens = [
		{ name: 'warmth', class: 'bg-warmth', textClass: 'text-foreground', label: 'Warmth' },
		{
			name: 'warmth-subtle',
			class: 'bg-warmth-subtle',
			textClass: 'text-warmth',
			label: 'Warmth Subtle'
		}
	];

	const functionalTokens = [
		{
			name: 'destructive',
			class: 'bg-destructive',
			textClass: 'text-destructive-foreground',
			label: 'Destructive'
		},
		{ name: 'border', class: 'bg-border', textClass: 'text-foreground', label: 'Border' }
	];
</script>
```

Each group renders as a heading + grid of swatches. Each swatch is a small card:

```svelte
{#each group as token}
	<div class="flex flex-col gap-1.5">
		<div class="h-16 w-full rounded-lg {token.class} {token.textClass} flex items-end p-2">
			<span class="text-label-md">{token.label}</span>
		</div>
		<code class="text-xs text-muted-foreground">bg-{token.name}</code>
	</div>
{/each}
```

### 2. Create `src/lib/components/ui/color-palette/ColorPalette.stories.svelte`

A Storybook story that displays the palette component. Use `svelte-csf` format:

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Color Palette',
		tags: ['autodocs']
	});
</script>

<script>
	import ColorPalette from './ColorPalette.svelte';
</script>

<Story name="All Tokens">
	<div class="space-y-12 bg-background p-8">
		<ColorPalette />
	</div>
</Story>
```

### 3. Create `src/lib/components/ui/color-palette/index.ts`

```ts
export { default as ColorPalette } from './ColorPalette.svelte';
```

### 4. Typography section

Add a typography section to `ColorPalette.svelte` that shows the editorial type scale:

```svelte
<section>
	<h2 class="mb-6 text-headline-md text-foreground">Typography Scale</h2>
	<div class="space-y-6 rounded-xl bg-card p-8">
		<div><span class="text-display-lg text-foreground">Display Large (3.5rem)</span></div>
		<div><span class="text-headline-md text-foreground">Headline Medium (1.75rem)</span></div>
		<div><span class="text-title-lg text-foreground">Title Large (1.25rem)</span></div>
		<div><span class="text-body-md text-foreground">Body Medium (0.875rem)</span></div>
		<div><span class="text-label-md text-muted-foreground">Label Medium (0.75rem)</span></div>
	</div>
</section>
```

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Run Storybook and verify the palette story displays correctly in both light and dark modes.
The swatches should automatically reflect theme changes via the ThemeToggle.
