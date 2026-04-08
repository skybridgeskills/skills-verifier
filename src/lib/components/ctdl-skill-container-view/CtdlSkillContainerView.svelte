<script lang="ts">
	import {
		extractCompetencyUrlsFromCtdlEntity,
		fetchCtdlResource,
		fetchSkillsByUrls
	} from '$lib/clients/skill-search-client';
	import SkillSearchResultItem from '$lib/components/skill-search/SkillSearchResultItem.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type {
		CtdlCompetencyFramework,
		CtdlFrameworkSearchResult,
		CtdlSkillContainer,
		CtdlSkillContainerSearchResult,
		Skill
	} from '$lib/types/job-profile';

	import CtdlEntityHeader from './CtdlEntityHeader.svelte';
	import type { LoadCtdlDetailFn } from './load-ctdl-detail-fn.js';

	interface Props {
		entityResult: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
		selectedUrls: string[];
		onBack: () => void;
		onToggleSkill: (skill: Skill, add: boolean) => void;
		onAddAll: (skills: Skill[]) => void;
		loadDetail?: LoadCtdlDetailFn;
	}

	let { entityResult, selectedUrls, onBack, onToggleSkill, onAddAll, loadDetail }: Props = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let entity = $state<CtdlSkillContainer | CtdlCompetencyFramework | null>(null);
	let skills = $state<Skill[]>([]);

	async function defaultLoadDetail(
		er: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult
	): Promise<{
		entity: CtdlSkillContainer | CtdlCompetencyFramework;
		skills: Skill[];
	}> {
		const fullEntity = await fetchCtdlResource(er['@id']);
		const urls = extractCompetencyUrlsFromCtdlEntity(fullEntity);
		const loaded = urls.length > 0 ? await fetchSkillsByUrls(urls) : [];
		return { entity: fullEntity, skills: loaded };
	}

	$effect(() => {
		const er = entityResult;
		let cancelled = false;

		async function run() {
			loading = true;
			error = null;
			entity = null;
			skills = [];
			try {
				const loader = loadDetail ?? defaultLoadDetail;
				const out = await loader(er);
				if (cancelled) return;
				entity = out.entity;
				skills = out.skills;
			} catch (err) {
				if (cancelled) return;
				error = err instanceof Error ? err.message : 'Failed to load entity details';
				entity = null;
				skills = [];
			} finally {
				if (!cancelled) loading = false;
			}
		}

		void run();

		return () => {
			cancelled = true;
		};
	});

	function handleAddAll() {
		onAddAll(skills);
	}

	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}

	async function retry() {
		loading = true;
		error = null;
		try {
			const loader = loadDetail ?? defaultLoadDetail;
			const out = await loader(entityResult);
			entity = out.entity;
			skills = out.skills;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load entity details';
			entity = null;
			skills = [];
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	{#if loading}
		<Skeleton class="h-24 w-full" />
		<div class="space-y-2">
			{#each [1, 2, 3] as i (i)}
				<Skeleton class="h-16 w-full" />
			{/each}
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
			<Button type="button" variant="outline" size="sm" class="mt-2" onclick={retry}>Retry</Button>
		</div>
	{:else if entity}
		<CtdlEntityHeader {entity} {onBack} />

		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="text-sm text-muted-foreground">
				{skills.length}
				{skills.length === 1 ? 'skill' : 'skills'} available
			</p>
			<Button
				type="button"
				size="sm"
				variant="outline"
				onclick={handleAddAll}
				disabled={skills.length === 0}
			>
				Add All
			</Button>
		</div>

		<div class="space-y-2">
			{#each skills as skill (skill.url)}
				<SkillSearchResultItem
					{skill}
					isSelected={isSelected(skill)}
					onToggle={() => onToggleSkill(skill, !isSelected(skill))}
				/>
			{/each}
		</div>
	{/if}
</div>
