# Phase 1: SkillSearch — Integrate Quick Picks into Empty State

## Scope

Update `SkillSearch.svelte` to accept quick picks, show them filtered by mode in the resting state, and route container/framework pick clicks to the drill-down view.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style Conventions

- Container queries (`@md:`, `@5xl:`, etc.) not media queries
- Import order: external → `$lib/` → relative
- camelCase for functions/variables
- Keep file under ~200 lines; extract if needed (SkillSearch is currently 321 lines — keep an eye on it)
- Order by abstraction: public interface first, helpers later

## Implementation Details

### 1. Add `picks` prop to SkillSearch

In `src/lib/components/skill-search/SkillSearch.svelte`:

```ts
import { QuickPicks } from '$lib/components/quick-picks';
import type {
	// ... existing imports ...
	QuickPickItem
} from '$lib/types/job-profile';

interface Props {
	selectedUrls: string[];
	onToggleSkill: (skill: Skill, add: boolean, source?: SkillSearchSource) => void;
	initialMode?: SearchMode;
	picks?: QuickPickItem[]; // NEW
}

let { selectedUrls, onToggleSkill, initialMode = 'skills', picks = [] }: Props = $props();
```

### 2. Add pick filtering helper

Below the existing `uiForSearchMode` helper:

```ts
const CONTAINER_PICK_TYPES = new Set(['Job', 'Occupation', 'WorkRole', 'Task']);

function picksForMode(mode: SearchMode, allPicks: QuickPickItem[]): QuickPickItem[] {
	if (mode === 'skills') return allPicks.filter((p) => p.type === 'Skill');
	if (mode === 'containers') return allPicks.filter((p) => CONTAINER_PICK_TYPES.has(p.type));
	if (mode === 'frameworks') return allPicks.filter((p) => p.type === 'Framework');
	return [];
}
```

Add a derived for the current filtered picks:

```ts
const filteredPicks = $derived(picksForMode(currentMode, picks));
```

### 3. Add quick pick click handler

This routes clicks differently based on pick type:

```ts
function handleQuickPickClick(pick: QuickPickItem, _skills: Skill[]) {
	if (pick.type === 'Skill') {
		const skill = pick.entity as Skill;
		onToggleSkill(skill, !selectedUrls.includes(skill.url));
	} else {
		handleContainerSelect(
			pick.entity as CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult
		);
	}
}
```

Note: `_skills` matches the `QuickPicks` callback signature `(pick, skills) => void` but we don't use it — container/framework picks route to drill-down instead of bulk-adding.

### 4. Replace empty state with quick picks

Replace the current empty state block at the bottom of the `aria-live` region:

**Before:**

```svelte
{:else if !hasSubmitted}
    <div
        class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
    >
        <p>Search to find {emptyHint}</p>
    </div>
{/if}
```

**After:**

```svelte
{:else}
    {#if filteredPicks.length > 0}
        <div>
            <p class="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Quick picks
            </p>
            <QuickPicks
                picks={filteredPicks}
                {selectedUrls}
                onTogglePick={handleQuickPickClick}
            />
        </div>
    {:else}
        <div
            class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
        >
            <p>Search to find {emptyHint}</p>
        </div>
    {/if}
{/if}
```

The change from `{:else if !hasSubmitted}` to `{:else}` means quick picks also reappear when the user clears the search input after a previous search. This feels natural — the picks are the "resting" state of the results area.

### 5. SkillSearch stories (optional update)

Consider adding a story variant that passes `picks` to show the new empty-state behavior. At minimum, existing stories should still work since `picks` defaults to `[]`.

## Validate

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
pnpm turbo check
pnpm turbo test
```

Verify:

- Existing SkillSearch stories render without error (picks default to `[]`, falling back to "Search to find..." text)
- No type errors from the new prop
