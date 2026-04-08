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

	const typeColors: Record<string, string> = {
		Job: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
		Occupation: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
		WorkRole: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
		Task: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
		CompetencyFramework: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200'
	};
</script>

<button
	type="button"
	class="group w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
	onclick={onSelect}
>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex flex-wrap items-center gap-2">
				<Badge variant="outline" class={typeColors[entity['@type']] ?? ''}>
					{entity['@type']}
				</Badge>
				{#if isContainer}
					<span class="text-xs text-muted-foreground">{entity.skillCount} skills</span>
				{:else}
					<span class="text-xs text-muted-foreground">{entity.skillCount} competencies</span>
				{/if}
			</div>
			<h4 class="truncate font-medium text-foreground">{entity.name}</h4>
			{#if entity.description}
				<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{entity.description}</p>
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
