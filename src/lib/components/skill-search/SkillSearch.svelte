<script lang="ts">
	import { searchSkills } from '$lib/clients/skill-search-client';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { Skill } from '$lib/types/job-profile';

	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	interface Props {
		selectedUrls: string[];
		onToggle: (skill: Skill, add: boolean) => void;
	}

	let { selectedUrls, onToggle }: Props = $props();

	let query = $state('');
	let results = $state<Skill[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSubmitted = $state(false);
	let lastSearchedQuery = $state('');

	const MIN_QUERY_LENGTH = 2;
	const MAX_RESULTS = 20;

	async function performSearch(q: string) {
		const trimmed = q.trim();
		if (trimmed.length < MIN_QUERY_LENGTH) {
			results = [];
			error = null;
			loading = false;
			return;
		}

		loading = true;
		error = null;
		try {
			results = await searchSkills(trimmed, MAX_RESULTS);
			lastSearchedQuery = trimmed;
		} catch (err) {
			results = [];
			error = err instanceof Error ? err.message : 'Search failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleSearchSubmit(event: SubmitEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (query.trim().length >= MIN_QUERY_LENGTH) {
			hasSubmitted = true;
			void performSearch(query);
		}
	}

	function handleRetry() {
		if (query.trim().length >= MIN_QUERY_LENGTH) {
			hasSubmitted = true;
			void performSearch(query);
		}
	}

	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}
</script>

<div class="space-y-4">
	<form onsubmit={handleSearchSubmit}>
		<label for="skill-search-input" class="sr-only">Search for skills</label>
		<div class="relative flex gap-2">
			<Input
				id="skill-search-input"
				type="search"
				bind:value={query}
				placeholder="Search by keyword (e.g. JavaScript, nursing)…"
				disabled={loading}
				class="w-full"
				autocomplete="off"
			/>
			<Button type="submit" disabled={loading || query.trim().length < MIN_QUERY_LENGTH}>
				{#if loading}
					<span class="sr-only">Searching...</span>
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						aria-hidden="true"
					></div>
				{:else}
					Search
				{/if}
			</Button>
		</div>
	</form>

	{#if error}
		<Alert variant="destructive">
			<AlertTitle>Search failed</AlertTitle>
			<AlertDescription class="flex flex-wrap items-center gap-2">
				<span>{error}</span>
				<Button type="button" variant="outline" size="sm" onclick={handleRetry}>Retry</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<div aria-live="polite" aria-busy={loading}>
		{#if loading}
			<div class="space-y-3">
				{#each [0, 1, 2] as i (i)}
					<Skeleton class="h-20 w-full" />
				{/each}
			</div>
		{:else if hasSubmitted && query.trim() === lastSearchedQuery && !error}
			{#if results.length === 0}
				<div
					class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
				>
					<p>No skills found for “{query.trim()}”.</p>
					<p class="mt-1 text-sm">Try a different search term.</p>
				</div>
			{:else}
				<div class="space-y-2">
					<p class="text-sm text-muted-foreground">
						{results.length} result{results.length === 1 ? '' : 's'}
					</p>
					{#each results as skill (skill.url)}
						<SkillSearchResultItem
							{skill}
							isSelected={isSelected(skill)}
							onToggle={() => onToggle(skill, !isSelected(skill))}
						/>
					{/each}
				</div>
			{/if}
		{:else if !hasSubmitted}
			<div
				class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
			>
				<p>Search for skills to add to the job</p>
			</div>
		{/if}
	</div>
</div>
