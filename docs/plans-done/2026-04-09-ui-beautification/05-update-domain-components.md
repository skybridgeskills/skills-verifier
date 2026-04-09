# Phase 5: Update Domain Components & Layout

## Scope

Apply the Kinetic Professional design philosophy to existing domain components and the
root layout. Replace hardcoded colors with semantic tokens, remove structural borders,
apply tonal layering, and refine typography.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- No raw hex or hardcoded Tailwind colors (`bg-blue-100`, etc.) — semantic tokens only.
- Container queries (`@md:`, etc.) over media queries.
- Tonal layering: boundaries via background shifts, not borders.
- Typography: use editorial scale utilities (`text-headline-md`, `text-title-lg`, etc.)
  where appropriate for headings, but don't force every element into the scale.

## Implementation Details

### 1. AppHeader — `src/lib/components/app-header/AppHeader.svelte`

Current:

```
border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
```

Updated:

```
bg-background/80 backdrop-blur-xl dark:bg-background/80
```

Remove `border-b border-border`. The glass effect provides enough visual separation.
The brand name ("Skills Verifier") should use `text-primary font-black tracking-tighter`
to match the examples.

### 2. QuickPickItem — `src/lib/components/quick-picks/QuickPickItem.svelte`

Replace the hardcoded type badge color mapping:

```ts
// Before:
const typeBadgeClasses: Record<string, string> = {
  Skill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Job: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ...
};

// After — use semantic tokens:
const typeBadgeClasses: Record<string, string> = {
  Skill: 'bg-flame-subtle text-flame dark:bg-flame-subtle dark:text-flame',
  Job: 'bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary',
  Occupation: 'bg-warmth-subtle text-warmth dark:bg-warmth-subtle dark:text-warmth',
  WorkRole: 'bg-flame-muted text-flame dark:bg-flame-muted dark:text-flame-foreground',
  Task: 'bg-warmth-subtle text-warmth dark:bg-warmth-subtle dark:text-warmth',
  Framework: 'bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary',
};
```

Replace the chip button styling:

- Remove `border` → use background shifts for selection state
- Unselected: `bg-muted text-foreground`
- Selected: `bg-primary-fixed text-primary`

### 3. SkillSearch — `src/lib/components/skill-search/SkillSearch.svelte`

- Update the search input to use the new ghost-border input style (should come
  automatically from the Input component update, but verify inline input styling
  if it uses custom classes instead of the `<Input>` component).
- Tab buttons: use `bg-accent` for unselected, `bg-primary text-primary-foreground`
  for selected.
- Section backgrounds: apply `bg-secondary` (surface-container-low) for the search
  container area to create tonal depth against the page `bg-background`.

### 4. SelectedSkillsColumn — `src/lib/components/selected-skills-column/SelectedSkillsColumn.svelte`

- Remove any `border-t` or `border-b` separators between skill items.
- Use `space-y-3` for vertical rhythm between items (whitespace-based separation).
- Section heading: use `text-label-md text-muted-foreground uppercase tracking-wider`.

### 5. SkillItem — `src/lib/components/skill-item/SkillItem.svelte`

- Apply tonal surface shift: `bg-card rounded-lg p-4` on a `bg-secondary` parent.
- Typography: title in `text-title-lg`, subtitle in `text-body-md text-muted-foreground`.

### 6. EntityResultItem — `src/lib/components/entity-result-item/EntityResultItem.svelte`

- Remove border if present. Use `bg-card rounded-xl shadow-ambient` for the card.
- Hover: `hover:bg-secondary transition-colors`.

### 7. CtdlEntityHeader — `src/lib/components/ctdl-skill-container-view/CtdlEntityHeader.svelte`

- Badge: use `bg-primary-container text-primary-foreground` (like the "Role Analysis"
  badge in the sidebar example).
- Title: `text-headline-md text-primary`.
- Description: `text-body-md text-muted-foreground`.

### 8. CtdlSkillContainerView — `src/lib/components/ctdl-skill-container-view/CtdlSkillContainerView.svelte`

- Apply surface hierarchy: the container view sits on `bg-secondary` with child
  skill rows on `bg-card`.
- Remove any divider lines between skill rows.

### 9. Root Layout — `src/routes/+layout.svelte`

The main element currently uses:

```
<main class="@container mx-auto max-w-7xl px-4 py-8">
```

Update to add more generous spacing matching the design's `spacing-12` / `spacing-16`:

```
<main class="@container mx-auto max-w-7xl px-4 py-12">
```

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Run Storybook and check that all updated component stories render with the new design.
Run the dev server and navigate through all pages to check visual consistency.
