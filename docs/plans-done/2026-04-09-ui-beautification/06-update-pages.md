# Phase 6: Update Pages

## Scope

Apply the Kinetic Professional design to the two main page components:
`CreateJobPage.svelte` and `JobDetailPage.svelte`. Focus on surface hierarchy,
spacing, border removal, and typography.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- No raw hex — semantic token classes only.
- Container queries (`@md:`, `@4xl:`, etc.) over media queries.
- Tonal layering for sections.
- Editorial typography scale for headings.

## Implementation Details

### 1. CreateJobPage — `src/lib/pages/CreateJobPage.svelte`

**Page heading:**

```svelte
<!-- Before -->
<h1 class="text-2xl font-bold text-foreground">Create job</h1>
<p class="mt-1 text-sm text-muted-foreground">...</p>

<!-- After -->
<h1 class="text-headline-md text-foreground">Create job</h1>
<p class="mt-2 text-body-md text-muted-foreground">...</p>
```

**Section separator:**

```svelte
<!-- Before -->
<div class="border-t border-border pt-6">

<!-- After — use spacing and tonal shift instead of border -->
<div class="mt-8 rounded-xl bg-secondary p-6">
```

**Search panel (desktop):**

```svelte
<!-- Before -->
<div class="rounded-xl border border-border bg-card p-6 shadow-lg">

<!-- After — borderless tonal card -->
<div class="rounded-xl bg-card p-6 shadow-ambient">
```

**Search panel heading:**

```svelte
<!-- Before -->
<h2 class="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">Search</h2>

<!-- After -->
<h2 class="mb-4 text-label-md tracking-wider text-muted-foreground uppercase">Search</h2>
```

**Dialog overlay and content:**

- Keep `bg-black/80` overlay as-is (it works well).
- Dialog content: replace `border` with ghost border `border border-border/15`:
  ```
  'fixed ... rounded-xl border border-border/15 bg-background p-6 shadow-ambient ...'
  ```

**Spacing:** Replace `space-y-6` top-level with `space-y-8` for more breathing room.

### 2. JobDetailPage — `src/lib/pages/JobDetailPage.svelte`

Read the current file and update:

- Page title: use `text-headline-md text-foreground`
- Back link: use `text-primary hover:text-primary-container` instead of default link color
- Job metadata (company, description): use `text-body-md text-muted-foreground`
- Skills section heading: use `text-title-lg`
- Skill list: wrap in `bg-secondary rounded-xl p-6` for tonal layering, with individual
  skill items on `bg-card` (from the updated SkillItem component)
- Remove any `border` dividers between skills
- Add `space-y-3` between skill items

### 3. Jobs list page — `src/routes/jobs/+page.svelte`

- Update the page heading to use `text-headline-md`
- Job list items: ensure they use tonal layering (should come from Card/component updates)
- "Create job" button: should now automatically have the purple gradient from the button update

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Run the dev server and navigate through:

- `/jobs` — list page with updated heading and buttons
- `/jobs/create` — form with tonal sections, borderless search panel
- `/jobs/[id]` — detail page with tonal skill list

Verify both light and dark mode on all pages.
