# Plan notes: Update UI to use skill search service

## Scope of work

- Replace the current **framework-first skill selection** with **direct skill search**
- Add new `SkillSearch` component that calls the `POST /api/skill-search` endpoint
- Update `CreateJobPage` to use skill search as the primary skill discovery mechanism
- Keep existing `QuickSkillPicks` for curated skills (fast path)
- Keep `SelectedSkillsColumn` for managing selected skills
- Potentially deprecate or repurpose `FrameworkSelector` and `SkillsList`

## Current state of the codebase

- **CreateJobPage.svelte**: Two-column layout with JobProfileForm, QuickSkillPicks, optional FrameworkSelector, SkillsList (when framework selected), SelectedSkillsColumn
- **FrameworkSelector.svelte**: Search/filter curated frameworks, select one, emits onSelect
- **SkillsList.svelte**: Fetches skills from selected framework via FrameworkClient, shows checkboxes, client-side search filter
- **SelectedSkillsColumn.svelte**: Shows selected skills, allows removal
- **QuickSkillPicks.svelte**: Shows curated SAMPLE_SKILLS as quick add buttons

**Current flow:**

1. User sees QuickSkillPicks (fast curated skills)
2. User can optionally browse FrameworkSelector
3. If framework selected, SkillsList loads from that framework
4. SkillsList has its own client-side filter
5. SelectedSkillsColumn shows chosen skills

**New desired flow:**

1. User still sees QuickSkillPicks (fast curated skills)
2. User can search for skills via new SkillSearch component
3. Search results appear with selection capability
4. SelectedSkillsColumn shows chosen skills (unchanged)
5. Framework metadata becomes optional/background (still useful for CTID enrichment)

## References

- Skill search service plan: `docs/plans-done/2026-04-07-skill-search-service/` (or current if not done)
- API endpoint: `POST /api/skill-search` with `{ query: string, limit?: number }`
- Returns: `{ results: SkillSearchResult[], meta: {...} }`

## Style conventions (for this plan)

- **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`)
- **shadcn-svelte** components for UI consistency
- **Async/debounce** pattern for search input (don't search on every keystroke)
- **Error states** with Alert component
- **Loading states** with Skeleton or spinner
- **No prop drilling** — use callbacks ($props) for events
- **Accessibility** — proper labels, keyboard navigation

## Questions (to resolve one at a time)

### Q1 — What is the primary skill discovery UX? ✅ **ANSWERED**

**Context**: Currently users pick from QuickSkillPicks OR browse Framework → SkillsList. The new skill search API allows searching by keyword across Credential Engine.

**Answer**: **Frameworks are no longer gating** — they're peers, not prerequisites. We want **direct skill searching** as the primary UX. Drastic changes are acceptable (no users yet).

- **Remove FrameworkSelector** entirely from primary flow
- **Remove SkillsList** (framework-based skill loading)
- **New SkillSearch component** — primary skill discovery via API search
- **Keep QuickSkillPicks** — fast curated skills path
- **Keep SelectedSkillsColumn** — managing selected skills

### Q2 — How should the search UI work? ✅ **ANSWERED**

**Context**: Need a search input, results list, loading state, error handling, debounce.

**Answer**:

- **Debounced input** — 300ms after last keystroke
- **Minimum query length** — 2 characters before searching
- **Results limit** — show top 20 results
- **Selection in results** — click to add skill (or checkbox)
- **Empty state** — "No skills found, try a different search"
- **Error state** — API error message with retry

### Q3 — What happens to existing framework-based selection? ✅ **ANSWERED**

**Context**: The new skill search can still enrich skills with framework metadata (via CE adapter), but users don't need to pick a framework first.

**Answer**: **Remove entirely for now**. FrameworkSelector and SkillsList components can be deleted from this page. If needed later, framework metadata can come through the search results (CE adapter includes CTID). The job may still track framework info if useful, but not UI-gated.

### Q4 — Do we need to update the data model? ✅ **ANSWERED**

**Context**: Currently `selectedSkills` is `Skill[]` with `url`, `name`, `ctid`. Skill search returns `SkillSearchResult` with `id`, `name`, `uri`, `ctid`, `description`.

**Answer**:

- Map `SkillSearchResult` → `Skill` on the client: `uri` becomes `url`, keep `name`, `ctid`, add `description` optionally
- Consider adding `description` field to `Skill` type for display
- `frameworksJson` field can stay on form (backend handles it) but UI doesn't manage it explicitly

---

## Answers (filled during question iteration)

### Q1 — Primary UX: Skills-first, no framework gating

- Remove `FrameworkSelector` and `SkillsList` from CreateJobPage
- New `SkillSearch` component with debounced API search
- Keep `QuickSkillPicks` for fast curated path
- Keep `SelectedSkillsColumn` for managing selections

### Q2 — Search UI behavior

- Debounce: 300ms
- Min query: 2 chars
- Max results: 20
- Click skill to add (no checkbox needed, simpler)
- Empty/error states with helpful messaging

### Q3 — Framework components

- **Delete from page**: FrameworkSelector, SkillsList
- Can delete files entirely or keep in repo for future reference
- Framework metadata comes through search results if CE provides it

### Q4 — Data model mapping

- `SkillSearchResult` → `Skill` type conversion on client
- Add `description?: string` to `Skill` type
- `frameworksJson` stays on form (backend compatibility)
