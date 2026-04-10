# Phase 3: Entity Result Item and CTDL Skill Container View

## Scope

Create components for displaying CTDL entity search results and the drill-down skill selection view.

## Implementation

### 1. Create `src/lib/components/entity-result-item/EntityResultItem.svelte`

Display a single CTDL entity result (container or framework):

```svelte
<script lang="ts">
	import type {
		CtdlSkillContainerSearchResult,
		CtdlFrameworkSearchResult
	} from '$lib/types/job-profile';
	import { Badge } from '$lib/components/ui/badge/index.js';

	interface Props {
		entity: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
		onSelect: () => void;
	}

	let { entity, onSelect }: Props = $props();

	const isContainer = $derived(['Job', 'Occupation', 'WorkRole', 'Task'].includes(entity['@type']));

	// Type badge colors
	const typeColors: Record<string, string> = {
		Job: 'bg-purple-100 text-purple-800',
		Occupation: 'bg-green-100 text-green-800',
		WorkRole: 'bg-orange-100 text-orange-800',
		Task: 'bg-yellow-100 text-yellow-800',
		CompetencyFramework: 'bg-pink-100 text-pink-800'
	};
</script>

<button
	type="button"
	class="group w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
	onclick={onSelect}
>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex items-center gap-2">
				<Badge variant="outline" class="text-xs {typeColors[entity['@type']] ?? ''}">
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
			class="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
	</div>
</button>
```

### 2. Create `src/lib/components/ctdl-skill-container-view/CtdlEntityHeader.svelte`

Header for the drill-down view with back button:

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { CtdlSkillContainer, CtdlCompetencyFramework } from '$lib/types/job-profile';

	interface Props {
		entity: CtdlSkillContainer | CtdlCompetencyFramework;
		onBack: () => void;
	}

	let { entity, onBack }: Props = $props();

	const typeColors: Record<string, string> = {
		Job: 'bg-purple-100 text-purple-800',
		Occupation: 'bg-green-100 text-green-800',
		WorkRole: 'bg-orange-100 text-orange-800',
		Task: 'bg-yellow-100 text-yellow-800',
		CompetencyFramework: 'bg-pink-100 text-pink-800'
	};

	const entityName = $derived(
		entity['ceterms:name']?.['en-US'] ?? entity['ceasn:name']?.['en-US'] ?? 'Untitled'
	);
	const entityDesc = $derived(
		entity['ceterms:description']?.['en-US'] ?? entity['ceasn:description']?.['en-US'] ?? ''
	);
</script>

<div class="space-y-3 border-b border-border pb-4">
	<Button variant="ghost" size="sm" onclick={onBack} class="-ml-2">
		<svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Back to results
	</Button>

	<div>
		<div class="mb-2 flex items-center gap-2">
			<Badge class={typeColors[entity['@type']] ?? ''}>{entity['@type']}</Badge>
			<span class="font-mono text-xs text-muted-foreground">{entity['ceterms:ctid']}</span>
		</div>
		<h3 class="text-lg font-semibold">{entityName}</h3>
		{#if entityDesc}
			<p class="mt-1 text-sm text-muted-foreground">{entityDesc}</p>
		{/if}
	</div>
</div>
```

### 3. Create `src/lib/components/ctdl-skill-container-view/CtdlSkillContainerView.svelte`

Main drill-down view component:

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type {
		CtdlSkillContainerSearchResult,
		CtdlFrameworkSearchResult,
		Skill
	} from '$lib/types/job-profile';
	import {
		fetchCtdlResource,
		fetchSkillsByUrls,
		extractSkillUrls
	} from '$lib/clients/skill-search-client';
	import CtdlEntityHeader from './CtdlEntityHeader.svelte';
	import { SkillSearchResultItem } from '$lib/components/skill-search';

	interface Props {
		entityResult: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
		selectedUrls: string[];
		onBack: () => void;
		onToggleSkill: (skill: Skill, add: boolean) => void;
		onAddAll: (skills: Skill[]) => void;
	}

	let { entityResult, selectedUrls, onBack, onToggleSkill, onAddAll }: Props = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let entity = $state<CtdlSkillContainer | CtdlCompetencyFramework | null>(null);
	let skills = $state<Skill[]>([]);

	// Load entity and skills on mount
	$effect(() => {
		loadEntityAndSkills();
	});

	async function loadEntityAndSkills() {
		loading = true;
		error = null;
		try {
			// Fetch full CTDL entity
			const fullEntity = await fetchCtdlResource(entityResult['@id']);
			entity = fullEntity;

			// Extract skill URLs
			const skillUrls = extractSkillUrls(fullEntity as CtdlSkillContainer);

			// Batch fetch skills
			if (skillUrls.length > 0) {
				skills = await fetchSkillsByUrls(skillUrls);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load entity details';
		} finally {
			loading = false;
		}
	}

	function handleAddAll() {
		onAddAll(skills);
	}

	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}
</script>

<div class="space-y-4">
	{#if loading}
		<Skeleton class="h-24 w-full" />
		<div class="space-y-2">
			{#each [1, 2, 3] as _}
				<Skeleton class="h-16 w-full" />
			{/each}
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
			<Button variant="outline" size="sm" class="mt-2" onclick={loadEntityAndSkills}>Retry</Button>
		</div>
	{:else if entity}
		<CtdlEntityHeader {entity} {onBack} />

		<div class="flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				{skills.length}
				{skills.length === 1 ? 'skill' : 'skills'} available
			</p>
			<Button size="sm" variant="outline" onclick={handleAddAll}>Add All</Button>
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
```

### 4. Create `src/lib/components/ctdl-skill-container-view/index.ts`

```typescript
export { default as CtdlSkillContainerView } from './CtdlSkillContainerView.svelte';
export { default as CtdlEntityHeader } from './CtdlEntityHeader.svelte';
```

### 5. Create stories

Stories for EntityResultItem and CtdlSkillContainerView with various states.

## Style Conventions

- CTDL type badges use consistent color scheme across components
- Loading states use Skeleton components
- Error states use Alert/Error styling
- Keep async logic in $effect with cleanup

## Validate

```bash
pnpm turbo check
cd apps/storybook && pnpm test:storybook -- 'src/lib/components/entity-result-item/'
cd apps/storybook && pnpm test:storybook -- 'src/lib/components/ctdl-skill-container-view/'
```
