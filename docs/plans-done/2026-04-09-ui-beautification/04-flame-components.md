# Phase 4: New Flame Components (Storybook-only)

## Scope

Build two new components that exercise the flame/warmth palette:

1. **SkillFlameMeter** — horizontal heat-intensity bar
2. **SkillProficiencyCard** — skill card with proficiency selector, flame meter, and credential slot

These are Storybook-only for now (no SvelteKit routes). They validate the token system and
serve as reference implementations for future feature work.

**Reference:** `00-example-match-detail-page-r-sidebar.html` — the skill cards and heat bars.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- Svelte 5 runes (`$props()`, `$state()`, `$derived()`).
- PascalCase component filenames.
- `tailwind-variants` (`tv()`) for any variant APIs; `cn()` for merging.
- No raw hex — semantic token classes only.
- TSDoc for public props.
- ~200-line file limit.

## Implementation Details

### 1. SkillFlameMeter — `src/lib/components/skill-flame-meter/`

A horizontal segmented bar that visualizes "heat intensity" from Low → Steady → High.

**Props:**

```ts
interface Props {
	/** 'low' | 'steady' | 'high' */
	level: 'low' | 'steady' | 'high';
	class?: string;
}
```

**Rendering:**

Three equal segments in a flex row on a `bg-accent` track (surface-container-high).
Based on `level`:

- **low**: segment 1 = `bg-border` (outline-variant), segments 2-3 = `bg-accent` (empty)
- **steady**: segment 1 = `bg-warmth-subtle`, segment 2 = `bg-warmth`, segment 3 = `bg-accent`
- **high**: segment 1 = `bg-warmth-subtle`, segment 2 = `bg-flame-muted`, segment 3 = `bg-flame`

Each segment has `gap-1` between, `h-1.5`, rounded ends (`rounded-l-full` / `rounded-r-full`).

A label row above shows "Heat Intensity" left-aligned and the level name right-aligned:

- low: `text-muted-foreground`
- steady: `text-warmth`
- high: `text-flame font-black`

**`SkillFlameMeter.svelte`** (~40 lines):

```svelte
<script lang="ts">
	import { cn } from '$lib/utils.js';

	interface Props {
		level: 'low' | 'steady' | 'high';
		class?: string;
	}

	let { level, class: className }: Props = $props();

	const segments = $derived(
		{
			low: ['bg-border', 'bg-accent', 'bg-accent'],
			steady: ['bg-warmth-subtle', 'bg-warmth', 'bg-accent'],
			high: ['bg-warmth-subtle', 'bg-flame-muted', 'bg-flame']
		}[level]
	);

	const labelColor = $derived(
		{
			low: 'text-muted-foreground',
			steady: 'text-warmth',
			high: 'text-flame'
		}[level]
	);
</script>

<div class={cn('space-y-2', className)}>
	<div class="flex items-center justify-between">
		<span class="text-label-md tracking-wider text-muted-foreground uppercase">Heat Intensity</span>
		<span class="text-label-md font-black uppercase {labelColor}">{level}</span>
	</div>
	<div class="flex h-1.5 w-full gap-1 rounded-full bg-accent">
		<div class="h-full w-1/3 rounded-l-full {segments[0]}"></div>
		<div class="h-full w-1/3 {segments[1]}"></div>
		<div class="h-full w-1/3 rounded-r-full {segments[2]}"></div>
	</div>
</div>
```

**`index.ts`:**

```ts
export { default as SkillFlameMeter } from './SkillFlameMeter.svelte';
```

**`SkillFlameMeter.stories.svelte`:**

Show three stories: Low, Steady, High — each demonstrating a different heat level.

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Skill Flame Meter',
		tags: ['autodocs']
	});
</script>

<script>
	import SkillFlameMeter from './SkillFlameMeter.svelte';
</script>

<Story name="Low">
	<div class="max-w-sm rounded-xl bg-card p-8">
		<SkillFlameMeter level="low" />
	</div>
</Story>

<Story name="Steady">
	<div class="max-w-sm rounded-xl bg-card p-8">
		<SkillFlameMeter level="steady" />
	</div>
</Story>

<Story name="High">
	<div class="max-w-sm rounded-xl bg-card p-8">
		<SkillFlameMeter level="high" />
	</div>
</Story>
```

### 2. SkillProficiencyCard — `src/lib/components/skill-proficiency-card/`

A card inspired by the match detail skill cards. Shows:

- Skill title (primary)
- Description (muted-foreground)
- Proficiency level selector (Novice / Proficient / Expert)
- SkillFlameMeter
- Optional credential attachment slot

**Props:**

```ts
interface Props {
	title: string;
	description: string;
	proficiency?: 'novice' | 'proficient' | 'expert';
	credential?: { name: string; issuer: string };
	onProficiencyChange?: (level: 'novice' | 'proficient' | 'expert') => void;
	class?: string;
}
```

**Proficiency → flame level mapping:**

- novice → low
- proficient → steady
- expert → high

**Proficiency button styling:**

- Unselected: `bg-accent text-muted-foreground hover:bg-muted`
- Selected novice: `bg-primary-fixed text-primary`
- Selected proficient: `bg-warmth-subtle text-foreground`
- Selected expert: `bg-flame text-flame-foreground`

**Credential slot:** If `credential` is provided, show a small attached-credential row
(like the example's CKA Certified row). If not, show a dashed placeholder.

**Flame gradient overlay:** When `proficiency` is `'expert'`, add a subtle flame gradient
in the top-right corner (the `skill-flame-gradient` from the example).

**`SkillProficiencyCard.svelte`** (~120 lines). Import `SkillFlameMeter`.

**`SkillProficiencyCard.stories.svelte`:**

Multiple stories showing different states:

- **Default (no proficiency)** — all buttons unselected, low flame
- **Novice** — novice selected, low flame
- **Proficient** — proficient selected, steady flame
- **Expert with Credential** — expert selected, high flame, credential attached
- **Interactive** — allows clicking proficiency buttons to see state changes

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Run Storybook and verify:

- SkillFlameMeter renders all three levels with correct colors
- SkillProficiencyCard renders all states
- Both work in light and dark mode
- The flame gradient overlay appears only in expert state
