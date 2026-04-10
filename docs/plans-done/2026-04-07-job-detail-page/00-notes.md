# Job Detail Page — Notes

## Scope of work

Add a read-only detail page at `/jobs/[id]` that shows the basic metadata of a
job and the skills selected for it. Then refactor the existing skill display
components into a single unified `SkillItem` component with clean variants.

## Current state

- **`JobResource` schema** exists (`src/lib/server/domain/job/job-resource.ts`)
  with fields: `id`, `createdAt`, `externalId`, `externalUrl?`, `name`,
  `description`, `company`, `frameworks[]`, `skills[]`, `status`.
- **`jobByIdQuery`** exists — looks up by internal UUID. Returns
  `JobResource | null`.
- **No dynamic routes** exist yet — this will be the first `[param]` route.
- **Job list page** (`/jobs`) items are not clickable.
- **Three separate skill display implementations** exist today:
  - `SkillItem` — checkbox toggle for quick picks on create page.
  - `SkillSearchResultItem` — add button / "Added" state for search results.
  - `SelectedSkillsColumn` — inline rendering with remove button for selected
    skills list.
- **`CreateJobPage`** lives in `$lib/pages/` with a thin route wrapper.
- **UI primitives** available: Badge, Card, Button, Alert, etc.

## Answered questions

### 1. URL parameter: internal `id`

Use internal `id` — it's the primary key, simpler lookup, and this is an
internal-facing app.

### 2. Job list links to detail page

Make each job's **title/name** a link to `/jobs/[id]`. Underline on hover.

### 3. Metadata to display

Show: `name` (heading), `company`, `description`, `status` (Badge),
`externalId`, `externalUrl` (as an "apply" link), `skills[]` (read-only list).
**Omit** `frameworks` (being removed in a future refactor) and `createdAt`.

### 4. Page component pattern

Create `$lib/pages/JobDetailPage.svelte` with a thin route wrapper at
`src/routes/jobs/[id]/+page.svelte`. Build good Storybook stories.

### 5. Skill display approach

**Phase 1:** Inline rendering in `JobDetailPage` to understand display needs.
**Phase 2:** Refactor into a unified `SkillItem` component with variants for:

- **readonly** — detail page display (no interactivity)
- **search-result** — replaces `SkillSearchResultItem` (add button / "Added"
  state)
- **selected** — replaces inline rendering in `SelectedSkillsColumn` (remove
  button)
- **toggle** — replaces current `SkillItem` (checkbox for quick picks)

Each variant gets its own Storybook stories. The unified component interface
should be clean and efficient.

## Notes

- `SkillSearchResultItem` shows `ctid` — consider whether the unified component
  should show ctid in all variants or make it configurable.
- The three current implementations all share the same core display pattern:
  `skill.label` as title, `skill.text` as subtitle/fallback. Good candidate for
  unification.

## Style conventions (for this plan)

- **Domain-first layout**: route at `src/routes/jobs/[id]/`, page component at
  `src/lib/pages/`.
- **ZodFactory**: already used for `JobResource` — no new schemas needed.
- **Factory functions**: no new services needed; reuse `jobByIdQuery`.
- **File naming**: kebab-case for TS, PascalCase for Svelte components.
- **Container queries**: use `@md:`, `@lg:` not `md:`, `lg:`.
- **Import order**: external → `$lib/` → relative.
- **~200-line files**: keep components concise; extract helpers early.
- **Storybook**: build stories for all new presentation components.
