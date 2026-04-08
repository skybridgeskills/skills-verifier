# Phase 2: Extract SkillItem as Bare Presentation Component

## Scope of phase

Rewrite `SkillItem.svelte` as a bare presentation component that renders only
the skill's title, subtitle, and ctid — no card wrapper, no interactivity. Then
update `SkillSearchResultItem` and `SelectedSkillsColumn` to compose this
component inside their existing chrome. Update `JobDetailPage` to use it too.
Update all stories.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- **Container queries**: `@md:`, `@lg:` not `md:`, `lg:`.
- **Import order**: external → `$lib/` → relative, blank lines between groups.
- **~200-line files**: keep each component file concise.
- **File naming**: PascalCase for `.svelte`.
- **Storybook**: stories for all changed components.

## Implementation Details

### 1. Rewrite `SkillItem.svelte` — bare presentation

Replace the existing checkbox-based `SkillItem` with a pure display component.
The current version is only used in its own stories (no app imports), so this is
a safe replacement.

```svelte
<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
	}

	let { skill }: Props = $props();

	const title = $derived(skill.label ?? skill.text);
	const subtitle = $derived(
		skill.label && skill.text && skill.text !== skill.label ? skill.text : null
	);
</script>

<div class="flex-1">
	<div class="leading-tight font-medium text-foreground">{title}</div>
	{#if subtitle}
		<p class="mt-1 text-sm leading-tight text-muted-foreground">{subtitle}</p>
	{/if}
	{#if skill.ctid}
		<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
	{/if}
</div>
```

Key decisions:

- Uses `flex-1` so it fills available space when placed inside a flex container.
- `title` derives from `label ?? text` (same logic currently duplicated across
  `SkillSearchResultItem` and `SelectedSkillsColumn`).
- `subtitle` shows `text` only when both `label` and `text` exist and differ.
- Shows `ctid` unconditionally (was inconsistent — search results showed it,
  selected column didn't).

### 2. Update `SkillItem.stories.svelte`

Stories for the base component in isolation:

- **With Label and Text** — shows title + subtitle + ctid
- **With Label Only** — shows label as title, no subtitle
- **With Text Only** — shows text as title, no subtitle
- **No CTID** — skill without ctid (edge case)
- **Long Text** — skill with very long description text (wrapping)

Each story should render `SkillItem` bare (no card wrapper) so the presentation
is visible.

### 3. Update `SkillSearchResultItem.svelte`

Replace the duplicated title/subtitle/ctid rendering with `<SkillItem>`:

**Before** (in both the selected and unselected branches):

```svelte
<div class="min-w-0 flex-1">
	<div class="font-medium text-foreground">{title}</div>
	{#if subtitle}
		<p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
	{/if}
	{#if skill.ctid}
		<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
	{/if}
</div>
```

**After:**

```svelte
<div class="min-w-0">
	<SkillItem {skill} />
</div>
```

Remove the local `title` and `subtitle` derived values — they now live in
`SkillItem`.

Existing stories should continue to work unchanged since the visual output is
the same.

### 4. Update `SelectedSkillsColumn.svelte`

Replace the inline title/subtitle rendering in the skill list with `<SkillItem>`:

**Before:**

```svelte
<div class="flex-1">
	{#if skill.label && skill.text}
		<div class="font-medium text-foreground">{skill.label}</div>
		<div class="mt-1 text-sm text-muted-foreground">{skill.text}</div>
	{:else if skill.label}
		<div class="font-medium text-foreground">{skill.label}</div>
	{:else}
		<div class="text-foreground">{skill.text}</div>
	{/if}
</div>
```

**After:**

```svelte
<SkillItem {skill} />
```

The `SkillItem`'s `flex-1` will fill the space beside the remove button, same
as the current `<div class="flex-1">`. This also adds `ctid` display to the
selected skills column (previously missing — consistent with search results).

### 5. Update `JobDetailPage.svelte`

Replace the inline skill rendering from Phase 1 with `<SkillItem>`:

**Before:**

```svelte
<li class="px-4 py-3">
	{#if skill.label && skill.text && skill.text !== skill.label}
		<div class="font-medium text-foreground">{skill.label}</div>
		<p class="mt-1 text-sm text-muted-foreground">{skill.text}</p>
	{:else}
		<div class="font-medium text-foreground">{skill.label ?? skill.text}</div>
	{/if}
	{#if skill.ctid}
		<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
	{/if}
</li>
```

**After:**

```svelte
<li class="px-4 py-3">
	<SkillItem {skill} />
</li>
```

## Validate

```sh
pnpm turbo check
pnpm turbo test
```

Verify visually in Storybook:

- `SkillItem` stories render correctly in isolation
- `SkillSearchResultItem` stories still look identical
- `SelectedSkillsColumn` stories still look identical (now also show ctid)
- `JobDetailPage` stories use `SkillItem` cleanly

Verify in the browser:

- Create job flow still works (search, quick picks, selected column)
- Job detail page still displays skills correctly
