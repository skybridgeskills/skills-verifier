# Sidebar Aesthetics - Analysis & Planning

## Scope of Work

Improve the Create Job page (`CreateJobPage.svelte`) layout and aesthetics, building on the functional search/selection work from the `2026-04-08-job-search-redesign` plan. That plan delivered the multi-mode search, quick picks, and responsive sidebar/dialog behavior. This plan focuses on:

1. **Breakpoint change**: Move the sidebar visibility from `@lg` (512px container) to `@5xl` (1024px) so it only appears on large desktop screens
2. **Aesthetic polish**: Merge sidebar into a single styled card, apply editorial-style spacing and section headers inspired by the HTML mockup
3. **Quick picks into search empty state**: Move quick picks inside SkillSearch as the initial view per mode tab, filtered by type. Search results replace them when the user submits a query.
4. **Fix container/framework quick pick drill-down**: Clicking a container/framework quick pick should open the drill-down view (like search results) instead of bulk-adding skills
5. **Preserve mobile**: Keep the existing dialog-based search on smaller screens

### What stays the same

- Search/selection logic (search API, result rendering, drill-down view)
- The Dialog-based mobile flow (though dialog content simplifies — no separate Quick Picks section)
- Type system, API clients, server-side code
- Existing child components (SkillSearchResultItem, EntityResultItem, CtdlSkillContainerView, QuickPickItem, etc.)
- SelectedSkillsColumn styling

## Current State

### Layout (CreateJobPage.svelte)

- **Grid**: `@lg:grid-cols-[1fr_340px]` — sidebar appears at `@lg` (32rem / 512px container width)
- **Sidebar**: Two separate cards (Quick Picks + Search) in `hidden @lg:block`
- **Mobile trigger**: "Add skills" button in `@lg:hidden` opens Dialog
- **Dialog**: `bits-ui` Dialog with QuickPicks + SkillSearch + Done button
- **Spacing**: `space-y-6` / `gap-6` — functional but compact

### Tailwind v4 Container Query Breakpoints (defaults)

| Token  | Width          |
| ------ | -------------- |
| `@lg`  | 32rem (512px)  |
| `@xl`  | 36rem (576px)  |
| `@2xl` | 42rem (672px)  |
| `@3xl` | 48rem (768px)  |
| `@4xl` | 56rem (896px)  |
| `@5xl` | 64rem (1024px) |
| `@6xl` | 72rem (1152px) |
| `@7xl` | 80rem (1280px) |

### HTML Mockup Reference (Untitled-2)

Key aesthetic elements from the mockup:

- `grid-template-columns: 1fr 400px` with `gap: 5rem` (wider sidebar, more breathing room)
- Uppercase `tracking-widest` tiny labels (e.g. "SEARCH LIBRARY", "QUICK PICKS")
- Single combined sidebar card (`rounded-2xl`, shadow, border) containing tabs + quick picks + search + results
- Selected skills with left border accent (`border-l-4 border-secondary`)
- More generous padding (`p-8`, `py-12`, `space-y-12`)
- Larger page heading with tight tracking

## Questions to Answer

### Question 1: Sidebar Breakpoint ✓

**Answer**: `@5xl` (1024px container width). This covers most desktop users while being meaningfully wider than the previous `@lg` (512px). The Storybook desktop preview at 1100px still works.

### Question 2: Aesthetic Scope ✓

**Answer**: Option B — Layout + sidebar card. Change breakpoint, widen sidebar (→ 400px), increase gap/padding, and merge the two sidebar cards into a single styled panel with uppercase `tracking-widest` section headers ("QUICK PICKS", "SEARCH"). Keeps existing form inputs, buttons, and global design system unchanged.

### Question 3: Selected Skills Styling ✓

**Answer**: Keep current SelectedSkillsColumn styling as-is. Follow-up if desired.

### Question 4: Quick Picks → Search Empty State ✓

**Answer**: Move quick picks into the SkillSearch component's empty/initial state for each mode tab. Key details:

1. **Filter by mode**: Only show quick picks matching the current search mode:
   - "Individual Skills" tab → skill-type picks only
   - "Jobs & Occupations" tab → occupation/job/workrole/task picks only
   - "Skill Frameworks" tab → framework picks only
2. **Display**: Keep the current pill/badge presentation (QuickPickItem), NOT the full search result style
3. **Replace on search**: When the user submits a search query, results replace the quick picks area
4. **Quick picks no longer a separate section**: Remove the standalone Quick Picks card/section from the sidebar and dialog; they live inside SkillSearch now

### Question 5: Quick Pick Drill-Down for Containers/Frameworks ✓

**Answer**: Fix the current behavior where clicking a container/framework quick pick bulk-adds all its skills as a flat list. Instead:

- **Skill-type picks**: Toggle directly (add/remove the single skill) — same as current
- **Container/framework picks**: Enter the drill-down view (CtdlSkillContainerView) showing the entity's subsidiary skills for individual selection — same UX as clicking a search result

This means SkillSearch needs to accept quick picks as a prop and handle the click routing:

- Skill pick click → `onToggleSkill(skill, !isSelected)`
- Container/framework pick click → enter drill-down state (`drillDownEntity = entity`)

### Question 6: Storybook Preview Width ✓

**Answer**: Add a `fluid` prop to `ResponsivePreview`:

- `fluid={false}` (default) — current behavior, fixed-width at `{width}px`
- `fluid={true}` — `width: 100%; min-width: {width}px`, fills available Storybook canvas while guaranteeing breakpoint fires

CreateJobPage desktop stories use `<ResponsivePreview width={1100} fluid>`. Other stories stay untouched.

## Style Conventions (for this plan)

- **Container queries** (`@5xl:`, etc.) not media queries, per project convention
- **Tailwind utility classes** — no custom CSS unless necessary
- Keep files under ~200 lines; extract if needed
- Co-locate tests as `<file>.test.ts`
- Import order: external → `$lib/` → relative

## Notes

(Will be populated with user answers)
