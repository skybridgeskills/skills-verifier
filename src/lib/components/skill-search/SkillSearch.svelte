<script lang="ts">
	import { searchSkills, type SearchMode } from '$lib/clients/skill-search-client';
	import { CtdlSkillContainerView } from '$lib/components/ctdl-skill-container-view';
	import { EntityResultItem } from '$lib/components/entity-result-item';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type {
		CtdlFrameworkSearchResult,
		CtdlSkillContainerSearchResult,
		Skill,
		SkillSearchSource
	} from '$lib/types/job-profile';

	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	interface Props {
		selectedUrls: string[];
		onToggleSkill: (skill: Skill, add: boolean, source?: SkillSearchSource) => void;
	}

	let { selectedUrls, onToggleSkill }: Props = $props();

	const modes: { id: SearchMode; label: string; mobileLabel?: string }[] = [
		{ id: 'skills', label: 'Individual Skills' },
		{ id: 'containers', label: 'Jobs & Occupations', mobileLabel: 'Jobs' },
		{ id: 'frameworks', label: 'Skill Frameworks', mobileLabel: 'Frameworks' }
	];

	let currentMode = $state<SearchMode>('skills');
	let query = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSubmitted = $state(false);
	let lastSearchedQuery = $state('');
	let lastSearchedMode = $state<SearchMode>('skills');

	let skillResults = $state<Skill[]>([]);
	let containerResults = $state<CtdlSkillContainerSearchResult[]>([]);
	let frameworkResults = $state<CtdlFrameworkSearchResult[]>([]);

	let drillDownEntity = $state<CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult | null>(
		null
	);

	const MIN_QUERY_LENGTH = 2;
	const MAX_RESULTS = 20;

	async function performSearch(q: string, mode: SearchMode) {
		const trimmed = q.trim();
		if (trimmed.length < MIN_QUERY_LENGTH) {
			loading = false;
			return;
		}

		loading = true;
		error = null;
		drillDownEntity = null;

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
			error = err instanceof Error ? err.message : 'Search failed. Please try again.';
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

	function drillDownSource(): SkillSearchSource | undefined {
		const e = drillDownEntity;
		if (!e) return undefined;
		if (e['@type'] === 'CompetencyFramework') {
			return { kind: 'framework', name: e.name, '@id': e['@id'] };
		}
		return {
			kind: 'container',
			name: e.name,
			'@id': e['@id'],
			'@type': e['@type']
		};
	}

	function handleAddAllFromDrillDown(skillsToAdd: Skill[]) {
		const src = drillDownSource();
		for (const skill of skillsToAdd) {
			if (!selectedUrls.includes(skill.url)) {
				onToggleSkill(skill, true, src);
			}
		}
	}

	function handleToggleFromDrillDown(skill: Skill, add: boolean) {
		onToggleSkill(skill, add, add ? drillDownSource() : undefined);
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		event.stopPropagation();
		triggerSearch();
	}

	function handleRetry() {
		if (query.trim().length >= MIN_QUERY_LENGTH) {
			hasSubmitted = true;
			void performSearch(query, currentMode);
		}
	}

	function isSkillSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}

	const searchPlaceholder = $derived(
		currentMode === 'skills'
			? 'Search skills by keyword (e.g. JavaScript, nursing)…'
			: currentMode === 'containers'
				? 'Search jobs & occupations…'
				: 'Search competency frameworks…'
	);

	const emptyHint = $derived(
		currentMode === 'skills'
			? 'skills to add to the job'
			: currentMode === 'containers'
				? 'jobs & occupations with associated skills'
				: 'frameworks that contain skills'
	);
</script>

<div class="space-y-4">
	<div class="flex border-b border-border">
		{#each modes as mode (mode.id)}
			<button
				type="button"
				class="border-b-2 px-3 py-2 text-sm font-medium transition-colors @md:px-4 {currentMode ===
				mode.id
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => handleModeChange(mode.id)}
			>
				<span class="hidden @md:inline">{mode.label}</span>
				<span class="@md:hidden">{mode.mobileLabel ?? mode.label}</span>
			</button>
		{/each}
	</div>

	{#if !drillDownEntity}
		<div>
			<label for="skill-search-input" class="sr-only">Search for skills and related entities</label>
			<div class="relative flex gap-2">
				<Input
					id="skill-search-input"
					type="search"
					bind:value={query}
					placeholder={searchPlaceholder}
					disabled={loading}
					class="w-full"
					autocomplete="off"
					onkeydown={handleSearchKeydown}
				/>
				<Button
					type="button"
					disabled={loading || query.trim().length < MIN_QUERY_LENGTH}
					onclick={triggerSearch}
				>
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
		</div>
	{/if}

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
		{#if drillDownEntity}
			<CtdlSkillContainerView
				entityResult={drillDownEntity}
				{selectedUrls}
				onBack={handleBackFromDrillDown}
				onToggleSkill={handleToggleFromDrillDown}
				onAddAll={handleAddAllFromDrillDown}
			/>
		{:else if loading}
			<div class="space-y-3">
				{#each [0, 1, 2] as i (i)}
					<Skeleton class="h-20 w-full" />
				{/each}
			</div>
		{:else if hasSubmitted && query.trim() === lastSearchedQuery && currentMode === lastSearchedMode && !error}
			{#if currentMode === 'skills'}
				{#if skillResults.length === 0}
					<div
						class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
					>
						<p>No skills found for “{query.trim()}”.</p>
						<p class="mt-1 text-sm">Try a different search term.</p>
					</div>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							{skillResults.length} result{skillResults.length === 1 ? '' : 's'}
						</p>
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
					<div
						class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
					>
						<p>No jobs or occupations found for “{query.trim()}”.</p>
					</div>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							{containerResults.length} result{containerResults.length === 1 ? '' : 's'}
						</p>
						{#each containerResults as entity (entity['@id'])}
							<EntityResultItem {entity} onSelect={() => handleContainerSelect(entity)} />
						{/each}
					</div>
				{/if}
			{:else if currentMode === 'frameworks'}
				{#if frameworkResults.length === 0}
					<div
						class="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground"
					>
						<p>No frameworks found for “{query.trim()}”.</p>
					</div>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							{frameworkResults.length} result{frameworkResults.length === 1 ? '' : 's'}
						</p>
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
				<p>Search to find {emptyHint}</p>
			</div>
		{/if}
	</div>
</div>
