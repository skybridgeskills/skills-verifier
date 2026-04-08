# Phase 4: SkillSearch Component Update

## Scope

Update the existing SkillSearch component to support multi-mode tabs and drill-down navigation.

## Implementation

### 1. Update `src/lib/components/skill-search/SkillSearch.svelte`

Major refactor to add mode tabs and drill-down state:

```svelte
<script lang="ts">
	import { searchSkills, type SearchMode } from '$lib/clients/skill-search-client';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type {
		Skill,
		CtdlSkillContainerSearchResult,
		CtdlFrameworkSearchResult
	} from '$lib/types/job-profile';
	import SkillSearchResultItem from './SkillSearchResultItem.svelte';
	import { EntityResultItem } from '$lib/components/entity-result-item';
	import { CtdlSkillContainerView } from '$lib/components/ctdl-skill-container-view';

	interface Props {
		selectedUrls: string[];
		onToggleSkill: (skill: Skill, add: boolean) => void;
	}

	let { selectedUrls, onToggleSkill }: Props = $props();

	// Mode state
	let currentMode = $state<SearchMode>('skills');
	let modes: { id: SearchMode; label: string; mobileLabel?: string }[] = [
		{ id: 'skills', label: 'Individual Skills' },
		{ id: 'containers', label: 'Jobs & Occupations', mobileLabel: 'Jobs' },
		{ id: 'frameworks', label: 'Skill Frameworks', mobileLabel: 'Frameworks' }
	];

	// Search state
	let query = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSubmitted = $state(false);
	let lastSearchedQuery = $state('');
	let lastSearchedMode = $state<SearchMode>('skills');

	// Results state
	let skillResults = $state<Skill[]>([]);
	let containerResults = $state<CtdlSkillContainerSearchResult[]>([]);
	let frameworkResults = $state<CtdlFrameworkSearchResult[]>([]);

	// Drill-down state
	let drillDownEntity = $state<CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult | null>(
		null
	);

	const MIN_QUERY_LENGTH = 2;
	const MAX_RESULTS = 20;

	async function performSearch(q: string, mode: SearchMode) {
		const trimmed = q.trim();
		if (trimmed.length < MIN_QUERY_LENGTH) return;

		loading = true;
		error = null;
		drillDownEntity = null; // Clear drill-down on new search

		try {
			const results = await searchSkills(trimmed, { mode, limit: MAX_RESULTS });

			if (mode === 'skills') {
				skillResults = results as Skill[];
			} else if (mode === 'containers') {
				containerResults = results as CtdlSkillContainerSearchResult[];
			} else {
				frameworkResults = results as CtdlFrameworkSearchResult[];
			}

			lastSearchedQuery = trimmed;
			lastSearchedMode = mode;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';
		} finally {
			loading = false;
		}
	}

	function triggerSearch() {
		if (query.trim().length >= MIN_QUERY_LENGTH) {
			hasSubmitted = true;
			void performSearch(query, currentMode);
		}
	}

	function handleModeChange(mode: SearchMode) {
		currentMode = mode;
		drillDownEntity = null;
		// Optionally auto-search if query exists
		if (query.trim().length >= MIN_QUERY_LENGTH && hasSubmitted) {
			void performSearch(query, mode);
		}
	}

	function handleContainerSelect(
		entity: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult
	) {
		drillDownEntity = entity;
	}

	function handleBackFromDrillDown() {
		drillDownEntity = null;
	}

	function handleAddAllFromDrillDown(skills: Skill[]) {
		skills.forEach((skill) => {
			if (!selectedUrls.includes(skill.url)) {
				onToggleSkill(skill, true);
			}
		});
	}

	function isSkillSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}

	// ... rest of existing handlers
</script>

<div class="space-y-4">
	<!-- Mode Tabs -->
	<div class="flex border-b border-border">
		{#each modes as mode}
			<button
				type="button"
				class="border-b-2 px-4 py-2 text-sm font-medium transition-colors {currentMode === mode.id
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => handleModeChange(mode.id)}
			>
				<span class="hidden md:inline">{mode.label}</span>
				<span class="md:hidden">{mode.mobileLabel ?? mode.label}</span>
			</button>
		{/each}
	</div>

	<!-- Search Input (hide in drill-down) -->
	{#if !drillDownEntity}
		<div class="relative flex gap-2">
			<Input
				type="search"
				bind:value={query}
				placeholder={currentMode === 'skills'
					? 'Search skills...'
					: currentMode === 'containers'
						? 'Search jobs & occupations...'
						: 'Search frameworks...'}
				disabled={loading}
				onkeydown={(e) => e.key === 'Enter' && triggerSearch()}
			/>
			<Button
				type="button"
				disabled={loading || query.trim().length < MIN_QUERY_LENGTH}
				onclick={triggerSearch}
			>
				{#if loading}
					<span class="animate-spin">⟳</span>
				{:else}
					Search
				{/if}
			</Button>
		</div>
	{/if}

	<!-- Error -->
	{#if error}
		<Alert variant="destructive">
			<AlertTitle>Search failed</AlertTitle>
			<AlertDescription class="flex items-center gap-2">
				{error}
				<Button variant="outline" size="sm" onclick={() => performSearch(query, currentMode)}>
					Retry
				</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Results Area -->
	<div aria-live="polite" aria-busy={loading}>
		{#if drillDownEntity}
			<!-- Drill-down View -->
			<CtdlSkillContainerView
				entityResult={drillDownEntity}
				{selectedUrls}
				onBack={handleBackFromDrillDown}
				{onToggleSkill}
				onAddAll={handleAddAllFromDrillDown}
			/>
		{:else if loading}
			<div class="space-y-3">
				{#each [0, 1, 2] as _}
					<Skeleton class="h-20 w-full" />
				{/each}
			</div>
		{:else if hasSubmitted && query.trim() === lastSearchedQuery && currentMode === lastSearchedMode && !error}
			<!-- Mode-specific results -->
			{#if currentMode === 'skills'}
				{#if skillResults.length === 0}
					<p class="py-8 text-center text-muted-foreground">No skills found</p>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">{skillResults.length} results</p>
						{#each skillResults as skill (skill.url)}
							<SkillSearchResultItem
								{skill}
								isSelected={isSkillSelected(skill)}
								onToggle={() => onToggleSkill(skill, !isSkillSelected(skill))}
							/>
						{/each}
					</div>
				{/if}
			{:else if currentMode === 'containers'}
				{#if containerResults.length === 0}
					<p class="py-8 text-center text-muted-foreground">No jobs or occupations found</p>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">{containerResults.length} results</p>
						{#each containerResults as entity (entity['@id'])}
							<EntityResultItem {entity} onSelect={() => handleContainerSelect(entity)} />
						{/each}
					</div>
				{/if}
			{:else if currentMode === 'frameworks'}
				{#if frameworkResults.length === 0}
					<p class="py-8 text-center text-muted-foreground">No frameworks found</p>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">{frameworkResults.length} results</p>
						{#each frameworkResults as entity (entity['@id'])}
							<EntityResultItem {entity} onSelect={() => handleContainerSelect(entity)} />
						{/each}
					</div>
				{/if}
			{/if}
		{:else if !hasSubmitted}
			<div
				class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
			>
				<p>
					Search to find {currentMode === 'skills'
						? 'skills'
						: currentMode === 'containers'
							? 'jobs & occupations'
							: 'frameworks'}
				</p>
			</div>
		{/if}
	</div>
</div>
```

### 2. Update `src/lib/components/skill-search/index.ts`

```typescript
export { default as SkillSearch } from './SkillSearch.svelte';
export { default as SkillSearchResultItem } from './SkillSearchResultItem.svelte';
```

### 3. Update stories

`SkillSearch.stories.svelte` with mode variants and drill-down states.

## Style Conventions

- Tabs use mobile-responsive labels (show shorter text on mobile)
- Drill-down hides search input to focus on selection
- Each mode has contextual empty state message
- Keep component under 200 lines (extract helpers if needed)

## Validate

```bash
pnpm turbo check
cd apps/storybook && pnpm test:storybook -- 'src/lib/components/skill-search/SkillSearch.stories.svelte'
```
