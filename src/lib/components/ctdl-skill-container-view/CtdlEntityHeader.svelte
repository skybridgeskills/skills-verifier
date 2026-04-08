<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { CtdlCompetencyFramework, CtdlSkillContainer } from '$lib/types/job-profile';

	interface Props {
		entity: CtdlSkillContainer | CtdlCompetencyFramework;
		onBack: () => void;
	}

	let { entity, onBack }: Props = $props();

	const typeColors: Record<string, string> = {
		Job: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
		Occupation: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
		WorkRole: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
		Task: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
		CompetencyFramework: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200'
	};

	const entityName = $derived.by(() => {
		if (entity['@type'] === 'CompetencyFramework') {
			return entity['ceasn:name']?.['en-US'] ?? entity['ceasn:name']?.['en'] ?? 'Untitled';
		}
		return entity['ceterms:name']?.['en-US'] ?? entity['ceterms:name']?.['en'] ?? 'Untitled';
	});
	const entityDesc = $derived.by(() => {
		if (entity['@type'] === 'CompetencyFramework') {
			return entity['ceasn:description']?.['en-US'] ?? entity['ceasn:description']?.['en'] ?? '';
		}
		return entity['ceterms:description']?.['en-US'] ?? entity['ceterms:description']?.['en'] ?? '';
	});
</script>

<div class="space-y-3 border-b border-border pb-4">
	<Button variant="ghost" size="sm" onclick={onBack} class="-ml-2">
		<svg
			class="mr-1 h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Back to results
	</Button>

	<div>
		<div class="mb-2 flex flex-wrap items-center gap-2">
			<Badge class={typeColors[entity['@type']] ?? ''}>{entity['@type']}</Badge>
			<span class="font-mono text-xs text-muted-foreground">{entity['ceterms:ctid']}</span>
		</div>
		<h3 class="text-lg font-semibold">{entityName}</h3>
		{#if entityDesc}
			<p class="mt-1 text-sm text-muted-foreground">{entityDesc}</p>
		{/if}
	</div>
</div>
