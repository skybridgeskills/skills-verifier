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
		onSelect: (skill: Skill) => void;
	}

	let { selectedUrls, onSelect }: Props = $props();

	let query = $state('');
	let results = $state<Skill[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const DEBOUNCE_MS = 300;
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
		} catch (err) {
			results = [];
			error = err instanceof Error ? err.message : 'Search failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const q = query;
		const id = setTimeout(() => {
			void performSearch(q);
		}, DEBOUNCE_MS);
		return () => clearTimeout(id);
	});

	function handleRetry() {
		if (query.trim().length >= MIN_QUERY_LENGTH) {
			void performSearch(query);
		}
	}

	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}
</script>

<div class="space-y-4">
	<div>
		<label for="skill-search-input" class="sr-only">Search for skills</label>
		<div class="relative">
			<Input
				id="skill-search-input"
				type="search"
				bind:value={query}
				placeholder="Search by keyword (e.g. JavaScript, nursing)…"
				disabled={loading}
				class="w-full pr-10"
				autocomplete="off"
			/>
			{#if loading}
				<div
					class="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-muted border-t-primary"
					aria-hidden="true"
				></div>
			{/if}
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			Type at least {MIN_QUERY_LENGTH} characters to search.
		</p>
	</div>

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
		{#if loading && query.trim().length >= MIN_QUERY_LENGTH}
			<div class="space-y-3">
				{#each [0, 1, 2] as i (i)}
					<Skeleton class="h-20 w-full" />
				{/each}
			</div>
		{:else if query.trim().length >= MIN_QUERY_LENGTH && !loading && !error}
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
							onSelect={() => onSelect(skill)}
						/>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
