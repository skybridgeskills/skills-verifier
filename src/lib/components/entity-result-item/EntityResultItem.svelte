<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type {
		CtdlFrameworkSearchResult,
		CtdlSkillContainerSearchResult
	} from '$lib/types/job-profile';

	interface Props {
		entity: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
		onSelect: () => void;
	}

	let { entity, onSelect }: Props = $props();

	const isContainer = $derived(
		entity['@type'] !== 'CompetencyFramework' &&
			['Job', 'Occupation', 'WorkRole', 'Task'].includes(entity['@type'])
	);

	/** Aligns with quick-pick entity semantics (job / warmth / flame layers). */
	const typeBadgeClasses: Record<string, string> = {
		Job: 'border-transparent bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary',
		Occupation:
			'border-transparent bg-warmth-muted text-warmth-end dark:bg-warmth-muted dark:text-warmth-end',
		WorkRole:
			'border-transparent bg-flame-muted text-flame dark:bg-flame-muted dark:text-flame-foreground',
		Task: 'border-transparent bg-warmth-subtle text-warmth dark:bg-warmth-subtle dark:text-warmth',
		CompetencyFramework:
			'border-transparent bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary'
	};
</script>

<button
	type="button"
	class="group w-full rounded-xl bg-card p-4 text-left shadow-ambient transition-colors hover:bg-secondary"
	onclick={onSelect}
>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex flex-wrap items-center gap-2">
				<Badge
					variant="outline"
					class={typeBadgeClasses[entity['@type']] ?? 'border-transparent bg-muted text-foreground'}
				>
					{entity['@type']}
				</Badge>
				{#if isContainer}
					<span class="text-xs text-muted-foreground">{entity.skillCount} skills</span>
				{:else}
					<span class="text-xs text-muted-foreground">{entity.skillCount} competencies</span>
				{/if}
			</div>
			<h4 class="truncate text-title-lg font-semibold text-foreground">{entity.name}</h4>
			{#if entity.description}
				<p class="mt-1 line-clamp-2 text-body-md text-muted-foreground">{entity.description}</p>
			{/if}
		</div>
		<svg
			class="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
	</div>
</button>
