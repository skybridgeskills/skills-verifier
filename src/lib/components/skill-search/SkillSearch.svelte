<script lang="ts">
	import { searchSkills, type SearchMode } from '$lib/clients/skill-search-client';
	import { CtdlSkillContainerView } from '$lib/components/ctdl-skill-container-view';
	import { EntityResultItem } from '$lib/components/entity-result-item';
	import { QuickPicks } from '$lib/components/quick-picks';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type {
		CtdlFrameworkSearchResult,
		CtdlSkillContainerSearchResult,
		QuickPickItem,
		Skill,
		SkillSearchSource
	} from '$lib/types/job-profile';

	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	interface Props {
		selectedUrls: string[];
		onToggleSkill: (skill: Skill, add: boolean, source?: SkillSearchSource) => void;
		/** Storybook: which tab is active initially */
		initialMode?: SearchMode;
		/** Quick picks shown in the empty state, filtered by current mode tab. */
		picks?: QuickPickItem[];
	}

	let { selectedUrls, onToggleSkill, initialMode = 'skills', picks = [] }: Props = $props();

	const modes: { id: SearchMode; label: string; mobileLabel?: string }[] = [
		{ id: 'skills', label: 'Individual Skills' },
		{ id: 'containers', label: 'Jobs & Occupations', mobileLabel: 'Jobs' },
		{ id: 'frameworks', label: 'Skill Frameworks', mobileLabel: 'Frameworks' }
	];

	// svelte-ignore state_referenced_locally
	let currentMode = $state<SearchMode>(initialMode);
	let query = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSubmitted = $state(false);
	let lastSearchedQuery = $state('');
	// svelte-ignore state_referenced_locally
	let lastSearchedMode = $state<SearchMode>(initialMode);

	let skillResults = $state<Skill[]>([]);
	let containerResults = $state<CtdlSkillContainerSearchResult[]>([]);
	let frameworkResults = $state<CtdlFrameworkSearchResult[]>([]);

	let drillDownEntity = $state<CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult | null>(
		null
	);

	const MIN_QUERY_LENGTH = 2;
	const MAX_RESULTS = 20;

	const DEFAULT_SEARCH_MODE: SearchMode = 'skills';

	const MODE_UI_COPY = {
		skills: {
			searchPlaceholder: 'Search skills by keyword (e.g. JavaScript, nursing)…',
			emptyHint: 'skills to add to the job'
		},
		containers: {
			searchPlaceholder: 'Search jobs & occupations…',
			emptyHint: 'jobs & occupations with associated skills'
		},
		frameworks: {
			searchPlaceholder: 'Search competency frameworks…',
			emptyHint: 'frameworks that contain skills'
		}
	} satisfies Record<SearchMode, { searchPlaceholder: string; emptyHint: string }>;

	function uiForSearchMode(mode: SearchMode) {
		return MODE_UI_COPY[mode] ?? MODE_UI_COPY[DEFAULT_SEARCH_MODE];
	}

	const CONTAINER_PICK_TYPES = new Set(['Job', 'Occupation', 'WorkRole', 'Task']);

	function picksForMode(mode: SearchMode, allPicks: QuickPickItem[]): QuickPickItem[] {
		if (mode === 'skills') return allPicks.filter((p) => p.type === 'Skill');
		if (mode === 'containers') return allPicks.filter((p) => CONTAINER_PICK_TYPES.has(p.type));
		if (mode === 'frameworks') return allPicks.filter((p) => p.type === 'Framework');
		return [];
	}

	const filteredPicks = $derived(picksForMode(currentMode, picks));

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

	const searchPlaceholder = $derived(uiForSearchMode(currentMode).searchPlaceholder);
	const emptyHint = $derived(uiForSearchMode(currentMode).emptyHint);
</script>

<div class="space-y-4">
	<div class="flex flex-wrap gap-1 rounded-lg bg-accent p-1">
		{#each modes as mode (mode.id)}
			<button
				type="button"
				class="rounded-md px-3 py-2 text-sm font-medium transition-colors @md:px-4 {currentMode ===
				mode.id
					? 'bg-primary text-primary-foreground shadow-xs'
					: 'text-muted-foreground hover:bg-muted'}"
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
						class="rounded-xl border border-dashed border-border/30 bg-muted/40 p-8 text-center text-muted-foreground"
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
						class="rounded-xl border border-dashed border-border/30 bg-muted/40 p-8 text-center text-muted-foreground"
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
						class="rounded-xl border border-dashed border-border/30 bg-muted/40 p-8 text-center text-muted-foreground"
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
		{:else if filteredPicks.length > 0}
			<div>
				<p class="mb-3 text-label-md tracking-wider text-muted-foreground uppercase">Quick picks</p>
				<QuickPicks picks={filteredPicks} {selectedUrls} onTogglePick={handleQuickPickClick} />
			</div>
		{:else}
			<div
				class="rounded-xl border border-dashed border-border/30 bg-muted/40 p-8 text-center text-muted-foreground"
			>
				<p>Search to find {emptyHint}</p>
			</div>
		{/if}
	</div>
</div>
