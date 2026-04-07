# Phase 3: SkillSearch component

## Scope of phase

- Create `SkillSearch.svelte` — Main search component with debounced API calls
- Loading state, error handling, empty state
- Uses `SkillSearchResultItem` for results
- Create stories for Storybook

## Code Organization Reminders

- Debounce logic in component (no external library)
- Separate concerns: search logic, result display
- Keep under ~200 lines (extract helpers if needed)

## Style conventions

- **shadcn-svelte** — `Input`, `Button`, `Skeleton`, `Alert` components
- **Debounced input** — 300ms delay, 2 char minimum
- **Accessibility** — `aria-live="polite"` for results, proper labels
- **Svelte 5** — `$state`, `$derived`, `$effect` for reactivity

## Implementation Details

### 3.1 Create `src/lib/components/skill-search/SkillSearch.svelte`

```svelte
<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { Skill } from '$lib/types/job-profile';
	import { searchSkills } from '$lib/clients/skill-search-client';
	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	interface Props {
		selectedUrls: string[];
		onSelect: (skill: Skill) => void;
	}

	let { selectedUrls, onSelect }: Props = $props();

	// State
	let query = $state('');
	let results = $state<Skill[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = $state(null);

	// Constants
	const DEBOUNCE_MS = 300;
	const MIN_QUERY_LENGTH = 2;
	const MAX_RESULTS = 20;

	// Perform search
	async function doSearch(searchQuery: string) {
		if (searchQuery.length < MIN_QUERY_LENGTH) {
			results = [];
			error = null;
			loading = false;
			return;
		}

		loading = true;
		error = null;

		try {
			const skills = await searchSkills(searchQuery, MAX_RESULTS);
			results = skills;
		} catch (err) {
			results = [];
			error = err instanceof Error ? err.message : 'Search failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	// Debounced search trigger
	function handleInput(event: Event) {
		const newQuery = (event.target as HTMLInputElement).value;
		query = newQuery;

		// Clear existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set new timer
		debounceTimer = setTimeout(() => {
			doSearch(newQuery);
		}, DEBOUNCE_MS);
	}

	// Clear on unmount
	$effect(() => {
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

	// Handle retry
	function handleRetry() {
		if (query.length >= MIN_QUERY_LENGTH) {
			doSearch(query);
		}
	}

	// Check if skill is already selected
	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}

	// Handle skill selection
	function handleSelect(skill: Skill) {
		onSelect(skill);
	}
</script>

<div class="space-y-4">
	<!-- Search input -->
	<div>
		<label for="skill-search-input" class="sr-only">Search for skills</label>
		<div class="relative">
			<Input
				id="skill-search-input"
				type="text"
				placeholder="Search for skills (e.g., JavaScript, project management...)"
				value={query}
				oninput={handleInput}
				disabled={loading}
				class="w-full"
			/>
			{#if loading}
				<div class="absolute top-1/2 right-3 -translate-y-1/2">
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
					></div>
				</div>
			{/if}
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			Type at least {MIN_QUERY_LENGTH} characters to search
		</p>
	</div>

	<!-- Error state -->
	{#if error}
		<Alert variant="destructive">
			<AlertTitle>Search failed</AlertTitle>
			<AlertDescription class="flex items-center gap-2">
				<span>{error}</span>
				<Button variant="outline" size="sm" onclick={handleRetry}>Retry</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Results region -->
	<div aria-live="polite" aria-busy={loading}>
		{#if loading && query.length >= MIN_QUERY_LENGTH}
			<!-- Loading skeletons -->
			<div class="space-y-3">
				{#each Array(3) as _, i (i)}
					<Skeleton class="h-20 w-full" />
				{/each}
			</div>
		{:else if query.length >= MIN_QUERY_LENGTH && !loading && !error}
			{#if results.length === 0}
				<!-- Empty state -->
				<div class="rounded-md border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
					<p class="text-gray-600">No skills found for "{query}"</p>
					<p class="mt-1 text-sm text-gray-500">Try a different search term</p>
				</div>
			{:else}
				<!-- Results list -->
				<div class="space-y-2">
					<p class="mb-2 text-sm text-muted-foreground">
						{results.length} result{results.length === 1 ? '' : 's'} found
					</p>
					{#each results as skill (skill.url)}
						<SkillSearchResultItem
							{skill}
							isSelected={isSelected(skill)}
							onSelect={() => handleSelect(skill)}
						/>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
```

### 3.2 Create `src/lib/components/skill-search/SkillSearch.stories.svelte`

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkillSearch from './SkillSearch.svelte';

	const { Story } = defineMeta({
		title: 'Components/SkillSearch/SkillSearch',
		component: SkillSearch
	});

	// Mock skills for stories
	const mockSkills = [
		{
			name: 'JavaScript',
			url: 'https://ce.com/js',
			ctid: 'ce-js',
			description: 'Programming language'
		},
		{
			name: 'TypeScript',
			url: 'https://ce.com/ts',
			ctid: 'ce-ts',
			description: 'Typed JavaScript'
		},
		{ name: 'React', url: 'https://ce.com/react', ctid: 'ce-react' }
	];
</script>

<script>
	import { fn } from '@storybook/test';
</script>

<Story
	name="Default"
	args={{
		selectedUrls: [],
		onSelect: fn()
	}}
/>

<Story
	name="With Selection"
	args={{
		selectedUrls: ['https://ce.com/js'],
		onSelect: fn()
	}}
/>
```

Note: For Storybook, we may need to mock `searchSkills` or use MSW. For now, stories show initial state.

### 3.3 Create `src/lib/components/skill-search/index.ts`

```typescript
export { default as SkillSearch } from './SkillSearch.svelte';
export { default as SkillSearchResultItem } from './SkillSearchResultItem.svelte';
```

## Tests

Integration tests will happen when used in CreateJobPage. Component unit tests:

```typescript
// SkillSearch.test.ts (optional - can defer to integration tests)
import { render, fireEvent, waitFor } from '@testing-library/svelte';
// ... test component interactions
```

For this phase, rely on:

- TypeScript compilation
- Storybook rendering
- Integration testing in next phase

## Validate

```bash
pnpm check
pnpm build:storybook
```

Verify:

- Component compiles
- Stories render
- No TypeScript errors
- Debounce logic is sound (no memory leaks, timer cleared)
