# Job Detail Page — Design

## Scope of work

1. Add a read-only job detail page at `/jobs/[id]`.
2. Link to it from the job list.
3. Refactor skill display into a composable `SkillItem` presentation component
   used by all skill-displaying contexts.

## File structure

```
src/routes/jobs/
├── +page.svelte                              # UPDATE: job title becomes a link
└── [id]/
    ├── +page.server.ts                       # NEW: load job by id, 404 if missing
    └── +page.svelte                          # NEW: thin wrapper → JobDetailPage

src/lib/pages/
├── JobDetailPage.svelte                      # NEW: read-only detail layout
└── JobDetailPage.stories.svelte              # NEW: storybook stories

src/lib/components/skill-item/
├── SkillItem.svelte                          # UPDATE: bare presentation (title, subtitle, ctid)
├── SkillItem.stories.svelte                  # UPDATE: stories for base component

src/lib/components/skill-search/
├── SkillSearchResultItem.svelte              # UPDATE: compose SkillItem inside
├── SkillSearchResultItem.stories.svelte      # (keep)

src/lib/components/selected-skills-column/
└── SelectedSkillsColumn.svelte               # UPDATE: compose SkillItem inside
```

Not changing:

- `QuickSkillPicks` — just `Button` pills; doesn't display subtitle/ctid.
- `SkillSearch.svelte` — orchestrates search, delegates to `SkillSearchResultItem`.

## Conceptual architecture

```
┌──────────────────────────────────────────────────┐
│  SkillItem (bare presentation)                   │
│  props: { skill: Skill }                         │
│  renders: title, subtitle, ctid — no wrapper     │
└──────────────┬───────────────────────────────────┘
               │ composed by:
    ┌──────────┼──────────────────────────────────┐
    ▼          ▼                                  ▼
 SearchResult  SelectedSkills     JobDetailPage / future apply page
 SkillItem     Column             (SkillItem in context-appropriate
 (card +       (card +             wrapper or bare)
  add/added    remove button)
  button)
```

### Detail page layout

```
/jobs/[id]
┌─────────────────────────────────────────────┐
│  ← Back to jobs                             │
│                                             │
│  Job Name                    [status badge] │
│  Company                                    │
│                                             │
│  Description text here...                   │
│                                             │
│  External ID: ext-abc-123                   │
│  Apply → https://example.com/apply          │
│                                             │
│  ── Skills (N) ─────────────────────────    │
│  ┌─────────────────────────────────────┐    │
│  │ Skill Label                         │    │
│  │ Skill description text              │    │
│  │ ce-ctid-123                         │    │
│  ├─────────────────────────────────────┤    │
│  │ Another Skill                       │    │
│  │ Another description                 │    │
│  │ ce-ctid-456                         │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data flow

```
+page.server.ts  →  jobByIdQuery({ id: params.id })
                     │
                     ├── null → error(404, 'Job not found')
                     └── JobResource → { job } → +page.svelte → JobDetailPage
```

## Style conventions

- **Factory functions, not classes** — no new services; reuse `jobByIdQuery`.
- **ZodFactory** — `JobResource` already defined; no new schemas.
- **Domain-first layout** — route at `src/routes/jobs/[id]/`, page component at
  `src/lib/pages/`.
- **File naming** — kebab-case for TS, PascalCase for Svelte components.
- **Container queries** — `@md:`, `@lg:` not `md:`, `lg:`.
- **Import order** — external → `$lib/` → relative, blank lines between groups.
- **~200-line files** — keep components concise; extract helpers early.
- **Storybook** — stories for all new/changed presentation components.
- **Order by abstraction** — exports first, helpers later.

## Phases

1. **Job detail page** — route, server load, `JobDetailPage` + stories, list
   page links. Inline skill rendering.
2. **Extract SkillItem** — rewrite as bare presentation; update
   `SkillSearchResultItem` and `SelectedSkillsColumn` to compose it; update all
   stories.
3. **Cleanup & validation** — remove dead code, validate, commit.
