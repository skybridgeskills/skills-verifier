# Phase 2: CreateJobPage + Sidebar Layout

## Scope

Update `CreateJobPage.svelte` to use the `@5xl` breakpoint, merge sidebar cards into one styled panel, remove standalone QuickPicks sections, and pass picks to SkillSearch. Update `SelectedSkillsColumn` breakpoint references.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style Conventions

- Container queries (`@5xl:`, `@md:`, etc.) not media queries
- Import order: external → `$lib/` → relative
- Tailwind utility classes — no custom CSS
- Keep files under ~200 lines

## Implementation Details

### 1. CreateJobPage.svelte — Breakpoint and grid

Change the grid breakpoint and widen sidebar:

**Before:**

```svelte
<div class="grid gap-6 @lg:grid-cols-[1fr_340px]">
```

**After:**

```svelte
<div class="grid gap-8 @5xl:grid-cols-[1fr_400px]">
```

### 2. CreateJobPage.svelte — Mobile trigger breakpoint

**Before:**

```svelte
<div class="@lg:hidden">
    <Dialog.Trigger ...>
```

**After:**

```svelte
<div class="@5xl:hidden">
    <Dialog.Trigger ...>
```

### 3. CreateJobPage.svelte — Merge sidebar into single card

Replace the two-card sidebar block:

**Before:**

```svelte
<div class="hidden space-y-6 @lg:block">
	<div class="rounded-lg border border-border bg-card p-4">
		<h2 class="mb-3 text-sm font-semibold text-foreground">Quick picks</h2>
		<QuickPicks picks={QUICK_PICKS} {selectedUrls} onTogglePick={handleToggleQuickPick} />
	</div>

	<div class="rounded-lg border border-border bg-card p-4">
		<h2 class="mb-3 text-sm font-semibold text-foreground">Search</h2>
		<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} />
	</div>
</div>
```

**After:**

```svelte
<div class="hidden @5xl:block">
	<div class="rounded-xl border border-border bg-card p-6 shadow-lg">
		<h2 class="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">Search</h2>
		<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} picks={QUICK_PICKS} />
	</div>
</div>
```

### 4. CreateJobPage.svelte — Simplify dialog content

Remove the standalone QuickPicks from the dialog. SkillSearch now handles picks internally.

**Before:**

```svelte
<Dialog.Content ...>
	<Dialog.Title ...>Add skills</Dialog.Title>
	<div class="mt-2 space-y-6">
		<div>
			<h3 class="mb-3 text-sm font-semibold text-foreground">Quick picks</h3>
			<QuickPicks picks={QUICK_PICKS} {selectedUrls} onTogglePick={handleToggleQuickPick} />
		</div>
		<div class="border-t border-border pt-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Search</h3>
			<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} />
		</div>
	</div>
	<div class="flex justify-end gap-2 pt-2">
		<Button type="button" onclick={() => (addSkillsOpen = false)}>Done</Button>
	</div>
</Dialog.Content>
```

**After:**

```svelte
<Dialog.Content ...>
	<Dialog.Title ...>Add skills</Dialog.Title>
	<div class="mt-2">
		<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} picks={QUICK_PICKS} />
	</div>
	<div class="flex justify-end gap-2 pt-2">
		<Button type="button" onclick={() => (addSkillsOpen = false)}>Done</Button>
	</div>
</Dialog.Content>
```

### 5. CreateJobPage.svelte — Remove unused imports and handler

After removing standalone QuickPicks from both sidebar and dialog:

- Remove `import { QuickPicks } from '$lib/components/quick-picks'` if no longer used directly
- Remove `handleToggleQuickPick` function if no longer called
- Keep `QUICK_PICKS` import (still passed to SkillSearch)

Check if `QuickPickItem` and related types from the `Props`/handlers can also be cleaned up.

### 6. SelectedSkillsColumn.svelte — Update breakpoint references

**Before:**

```svelte
<p class="mt-1 text-xs text-muted-foreground @lg:hidden">
	Tap <strong class="font-medium">Add skills</strong> below.
</p>
<p class="mt-1 hidden text-xs text-muted-foreground @lg:block">
	Use the <strong class="font-medium">Add skills</strong> panel on the right.
</p>
```

**After:**

```svelte
<p class="mt-1 text-xs text-muted-foreground @5xl:hidden">
	Tap <strong class="font-medium">Add skills</strong> below.
</p>
<p class="mt-1 hidden text-xs text-muted-foreground @5xl:block">
	Use the <strong class="font-medium">Add skills</strong> panel on the right.
</p>
```

## Validate

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
pnpm turbo check
pnpm turbo test
```

Verify:

- No type errors from removed imports/handlers
- CreateJobPage stories still render (sidebar now needs ≥1024px container to appear)
- Dialog still works for mobile view
