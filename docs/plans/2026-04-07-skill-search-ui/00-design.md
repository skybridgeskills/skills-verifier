# Design: Update UI to use skill search service

## Scope of work

- **Remove** framework-first components from `CreateJobPage` (`FrameworkSelector`, `SkillsList`)
- **Create** `SkillSearch` component — primary skill discovery via `POST /api/skill-search`
- **Update** `CreateJobPage` layout — skills-first, no framework gating
- **Keep** `QuickSkillPicks` — fast curated skills path
- **Keep** `SelectedSkillsColumn` — managing selected skills
- **Map** `SkillSearchResult` → `Skill` type for consistency

## File structure

```
src/lib/components/skill-search/
├── SkillSearch.svelte                  # NEW: Search input + results + selection
├── SkillSearch.stories.svelte          # NEW: Storybook stories
├── SkillSearchResultItem.svelte        # NEW: Single result item (clickable)
└── index.ts                            # NEW: Public exports

src/lib/pages/
└── CreateJobPage.svelte                # UPDATE: Remove FrameworkSelector/SkillsList, add SkillSearch

src/lib/types/
└── job-profile.ts                      # UPDATE: Add description to Skill type

src/lib/components/
├── framework-selector/                 # DELETE or MOVE (no longer used on this page)
│   ├── FrameworkSelector.svelte
│   └── FrameworkSelector.stories.svelte
├── skills-list/                        # DELETE or MOVE (no longer used on this page)
│   ├── SkillsList.svelte
│   └── SkillsList.stories.svelte
└── quick-skill-picks/                  # KEEP (minor updates if needed)
    └── QuickSkillPicks.svelte

src/lib/components/selected-skills-column/
└── SelectedSkillsColumn.svelte         # KEEP (no changes needed)
```

## Conceptual architecture

```
CreateJobPage
├── JobProfileForm (unchanged)
│
├── QuickSkillPicks ──► selectedSkills
│   (curated list, click to add)
│
├── SkillSearch ──────► selectedSkills
│   ├── SearchInput (debounced)
│   ├── LoadingState
│   ├── ErrorState
│   └── ResultsList
│       └── SkillSearchResultItem (click to add)
│
└── SelectedSkillsColumn ◄── selectedSkills
    (display + remove)
```

**Data flow:**

1. User types in `SkillSearch` → debounced `POST /api/skill-search` → results displayed
2. User clicks skill in results OR `QuickSkillPicks` → added to `selectedSkills` (shared state)
3. `SelectedSkillsColumn` shows selected skills, allows removal
4. Form submission sends `skillsJson` to server (existing behavior)

**No framework gate:** Skills come directly from search API or curated list. Framework metadata may be present on skills from CE, but no explicit framework selection step.

## Main components and how they interact

### SkillSearch.svelte

**Props interface:**

```typescript
interface Props {
	selectedUrls: string[]; // Already selected skill URIs (disable in results)
	onSelect: (skill: Skill) => void; // Callback when user clicks a skill
}
```

**Internal state:**

- `query: string` — current search input
- `results: Skill[]` — search results (mapped from API response)
- `loading: boolean` — search in progress
- `error: string | null` — error message
- `debounceTimer: ReturnType<typeof setTimeout> | null`

**Behavior:**

1. User types → debounce 300ms → call API
2. Min 2 chars before searching
3. Display loading state while fetching
4. Map `SkillSearchResult[]` → `Skill[]` on response
5. Click result → call `onSelect` with `Skill` object
6. Already-selected skills show "Added" state (not clickable)

### SkillSearchResultItem.svelte

**Props:**

```typescript
interface Props {
	skill: Skill;
	isSelected: boolean;
	onClick: () => void;
}
```

**Display:**

- Skill name (bold)
- Description (if present, muted text)
- CTID badge (if present, subtle)
- "Added" checkmark if already selected

### CreateJobPage.svelte (updated)

**Removed:**

- `FrameworkSelector` import and usage
- `SkillsList` import and usage
- `selectedFramework` state
- `frameworksJson` hidden input (may keep for backend compat, not UI-managed)

**Added:**

- `SkillSearch` import and usage

**Layout:**

```svelte
<div class="space-y-6">
	<h1>Create job</h1>

	<!-- Job details -->
	<JobProfileForm />

	<!-- Quick curated picks -->
	<div>
		<h2>Quick skill picks</h2>
		<QuickSkillPicks {selectedUrls} onToggleSkill={handleAddSkill} />
	</div>

	<!-- Primary skill search -->
	<div>
		<h2>Search for skills</h2>
		<SkillSearch {selectedUrls} onSelect={handleAddSkill} />
	</div>

	<!-- Selected skills review -->
	<div>
		<h2>Selected skills ({selectedSkills.length})</h2>
		<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
	</div>

	<Button type="submit">Save job</Button>
</div>
```

### Skill type update (job-profile.ts)

```typescript
export interface Skill {
	name: string;
	url: string;
	ctid?: string;
	description?: string; // NEW: From SkillSearchResult
}
```

## API client function

Add to `src/lib/clients/skill-search-client.ts` (or inline in component initially):

```typescript
export async function searchSkills(query: string, limit = 20): Promise<Skill[]> {
	const response = await fetch('/api/skill-search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, limit })
	});

	if (!response.ok) {
		throw new Error(`Search failed: ${response.status}`);
	}

	const data = await response.json();

	// Map SkillSearchResult -> Skill
	return data.results.map((result: SkillSearchResult) => ({
		name: result.name,
		url: result.uri, // Map uri -> url
		ctid: result.ctid,
		description: result.description
	}));
}
```

## Style conventions

- **Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$props` everywhere
- **shadcn-svelte** — `Input`, `Button`, `Skeleton`, `Alert` components
- **Debounced search** — `setTimeout`/`clearTimeout` pattern (no external library needed for this)
- **Loading states** — Skeleton for results list, spinner in input
- **Error states** — Alert component with retry button
- **Accessibility** —
  - `aria-live="polite"` for results region
  - `aria-busy"` during loading
  - Proper labels on search input
  - Keyboard navigable results (click or Enter to select)

## File organization reminders

- One component per file (SkillSearch, SkillSearchResultItem separate)
- Co-locate stories (`.stories.svelte`) with components
- Keep files under ~200 lines (split if needed)
- Order: exports/types → main logic → helper functions → styles

## Proposed implementation phases

1. **Type update + client function** — Add `description` to `Skill` type, create `searchSkills` API client
2. **SkillSearchResultItem component** — Single result display, click handling, "Added" state
3. **SkillSearch component** — Debounced search, loading/error states, results list, stories
4. **Update CreateJobPage** — Remove FrameworkSelector/SkillsList, integrate SkillSearch, update layout
5. **Cleanup** — Remove/delete unused framework-selector/skills-list components (or move to archive), validate all

When you confirm, save phase files `01-` through `05-` with full Implementation Details and Validate sections.
