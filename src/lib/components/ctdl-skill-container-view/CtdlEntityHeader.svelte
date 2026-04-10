<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { CtdlCompetencyFramework, CtdlSkillContainer } from '$lib/types/job-profile';

	interface Props {
		entity: CtdlSkillContainer | CtdlCompetencyFramework;
		onBack: () => void;
	}

	let { entity, onBack }: Props = $props();

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

<div class="space-y-3 pb-2">
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
			<Badge class="border-transparent bg-primary-container text-primary-foreground">
				{entity['@type']}
			</Badge>
			<span class="font-mono text-xs text-muted-foreground">{entity['ceterms:ctid']}</span>
		</div>
		<h3 class="text-headline-md text-primary">{entityName}</h3>
		{#if entityDesc}
			<p class="mt-1 text-body-md text-muted-foreground">{entityDesc}</p>
		{/if}
	</div>
</div>
