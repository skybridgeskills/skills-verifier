# Sidebar Aesthetics - Design

## Scope of Work

Improve the Create Job page layout and search UX:

1. Move sidebar breakpoint from `@lg` (512px) to `@5xl` (1024px) — desktop-only sidebar
2. Merge two sidebar cards into one styled panel with section headers
3. Move quick picks into SkillSearch's empty/initial state, filtered by current mode tab
4. Fix container/framework quick pick clicks to enter drill-down view instead of bulk-adding
5. Add `fluid` prop to ResponsivePreview for Storybook
6. Keep mobile dialog-based search unchanged (except it no longer has a separate Quick Picks section)

## File Structure

```
src/lib/
├── storybook/
│   └── responsive-preview.svelte              # UPDATE: Add `fluid` boolean prop
├── pages/
│   ├── CreateJobPage.svelte                   # UPDATE: @5xl breakpoint, merged sidebar card, remove standalone QuickPicks
│   └── CreateJobPage.stories.svelte           # UPDATE: Use fluid prop on desktop stories
├── components/
│   ├── skill-search/
│   │   └── SkillSearch.svelte                 # UPDATE: Accept `picks` prop, show filtered picks in empty state,
│   │                                          #         route container/framework pick clicks to drill-down
│   ├── selected-skills-column/
│   │   └── SelectedSkillsColumn.svelte        # UPDATE: @lg → @5xl in empty-state hint text
│   └── quick-picks/
│       ├── QuickPicks.svelte                  # NO CHANGE (reused by SkillSearch)
│       └── QuickPickItem.svelte               # NO CHANGE
```

## Conceptual Architecture

```
CreateJobPage
├── Form column (left)
│   ├── JobProfileForm
│   ├── SelectedSkillsColumn
│   ├── "Add skills" dialog trigger (@5xl:hidden)
│   └── Save button
│
├── Sidebar card (right, hidden @5xl:block)    ← single merged card
│   ├── Section header: "Search"
│   └── SkillSearch(picks=QUICK_PICKS)         ← picks passed in
│       ├── Mode tabs
│       ├── Search input
│       └── Results area
│           ├── [no search yet] → QuickPicks(filtered by mode)
│           │   ├── Skill pick click → toggle skill directly
│           │   └── Container/Framework pick click → drill-down view
│           ├── [searched] → search results
│           └── [drill-down] → CtdlSkillContainerView
│
└── Dialog (mobile)
    └── SkillSearch(picks=QUICK_PICKS)         ← same component, same behavior
```

## Key Behavioral Changes

### SkillSearch accepts quick picks

New prop: `picks: QuickPickItem[]` (defaults to `[]`).

Picks are filtered per mode tab:

- `'skills'` → picks where `type === 'Skill'`
- `'containers'` → picks where `type` is `Job`, `Occupation`, `WorkRole`, or `Task`
- `'frameworks'` → picks where `type === 'Framework'`

### Quick pick click routing

- **Skill pick**: Calls `onToggleSkill(skill, !isSelected)` — toggles directly
- **Container/Framework pick**: Sets `drillDownEntity = pick.entity` — enters drill-down view showing subsidiary skills for individual selection

This fixes the current bug where container picks bulk-add skills without showing the drill-down.

### Quick picks replace empty state

The current "Search to find {emptyHint}" placeholder is replaced by quick picks (pill/badge display). Quick picks show when:

- No search has been submitted for the current mode, OR
- The query has been cleared (length < MIN_QUERY_LENGTH) after a previous search

When the user submits a search, results replace the quick picks area.

### Sidebar card styling

Two separate cards → one merged card:

- Container: `rounded-xl border border-border bg-card p-6 shadow-lg`
- Section header: `text-xs font-bold uppercase tracking-widest text-muted-foreground`
- SkillSearch fills the card body

### ResponsivePreview fluid mode

New prop: `fluid: boolean` (defaults to `false`).

- `false`: Current behavior — fixed width at `{width}px`
- `true`: `width: 100%; min-width: {width}px` — fills available Storybook canvas while guaranteeing the container query breakpoint fires

## Style Conventions

- **Container queries** (`@5xl:`, `@md:`, etc.) not media queries — per project convention
- **Tailwind utility classes** — no custom CSS unless necessary
- **File size** — extract when approaching ~200 lines
- **Co-locate tests** as `<file>.test.ts`
- **Import order**: external → `$lib/` → relative
- **Naming**: camelCase for functions/variables, PascalCase for components/factories
- **Order by abstraction**: high-level exports first, helpers later
- Keep existing component APIs stable; add props, don't break callers
