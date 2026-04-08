# Phase 2: Quick Picks Component (Multi-Type)

## Scope

Create a new QuickPicks component that supports multiple CTDL entity types with type badges, replacing the existing QuickSkillPicks.

## Implementation

### 1. Create `src/lib/components/quick-picks/QuickPickItem.svelte`

Single tag component with type label:

```svelte
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { QuickPickItem as QuickPickItemType } from '$lib/types/job-profile';

	interface Props {
		pick: QuickPickItemType;
		isSelected: boolean;
		onClick: () => void;
	}

	let { pick, isSelected, onClick }: Props = $props();

	// Type badge color mapping
	const typeBadgeVariant: Record<string, string> = {
		Skill: 'bg-blue-100 text-blue-800',
		Job: 'bg-purple-100 text-purple-800',
		Occupation: 'bg-green-100 text-green-800',
		WorkRole: 'bg-orange-100 text-orange-800',
		Task: 'bg-yellow-100 text-yellow-800',
		Framework: 'bg-pink-100 text-pink-800'
	};

	const entityName = $derived(
		'name' in pick.entity
			? pick.entity.name
			: (pick.entity.label ?? pick.entity.text ?? pick.entity.ctid)
	);
</script>

<button
	type="button"
	class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary {isSelected
		? 'border-primary bg-primary/10'
		: 'bg-surface-container-low border-outline-variant/30'}"
	onclick={onClick}
>
	<span
		class="text-xs font-semibold tracking-wider uppercase {typeBadgeVariant[pick.type] ??
			'bg-gray-100 text-gray-800'} rounded px-1.5 py-0.5"
	>
		{pick.type}
	</span>
	<span class="max-w-[200px] truncate">{entityName}</span>
	{#if isSelected}
		<svg class="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
</button>
```

### 2. Create `src/lib/components/quick-picks/QuickPicks.svelte`

Main component for the quick picks section:

```svelte
<script lang="ts">
	import type { QuickPickItem, Skill } from '$lib/types/job-profile';
	import QuickPickItemComponent from './QuickPickItem.svelte';

	interface Props {
		picks: QuickPickItem[];
		selectedUrls: string[];
		onTogglePick: (pick: QuickPickItem, skills: Skill[]) => void;
	}

	let { picks, selectedUrls, onTogglePick }: Props = $props();

	function isPickSelected(pick: QuickPickItem): boolean {
		// For skills, check by URL
		if (pick.type === 'Skill') {
			const skill = pick.entity as Skill;
			return selectedUrls.includes(skill.url);
		}
		// For containers/frameworks, check if all their skills are selected
		if (pick.skills && pick.skills.length > 0) {
			return pick.skills.every((s) => selectedUrls.includes(s.url));
		}
		return false;
	}

	function handlePickClick(pick: QuickPickItem) {
		// For containers, pass all pre-fetched skills
		// For skills, pass as single-item array
		const skills = pick.skills ?? [pick.entity as Skill];
		onTogglePick(pick, skills);
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-2">
		{#each picks as pick (pick.entity['@id'] ?? (pick.entity as Skill).url)}
			<QuickPickItemComponent
				{pick}
				isSelected={isPickSelected(pick)}
				onClick={() => handlePickClick(pick)}
			/>
		{/each}
	</div>
</div>
```

### 3. Create `src/lib/components/quick-picks/index.ts`

```typescript
export { default as QuickPicks } from './QuickPicks.svelte';
export { default as QuickPickItem } from './QuickPickItem.svelte';
```

### 4. Create stories

`QuickPicks.stories.svelte`:

```svelte
<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import QuickPicks from './QuickPicks.svelte';
	import { SAMPLE_OCCUPATIONS, SAMPLE_JOBS, SAMPLE_SKILLS } from '$lib/config/sample-entities';

	const { Story } = defineMeta({
		title: 'components/QuickPicks',
		tags: ['autodocs']
	});

	const mixedPicks = [
		...SAMPLE_OCCUPATIONS.slice(0, 2),
		...SAMPLE_JOBS.slice(0, 1),
		...SAMPLE_SKILLS.slice(0, 2)
	];
</script>

<Story name="Default">
	<QuickPicks picks={mixedPicks} selectedUrls={[]} onTogglePick={() => {}} />
</Story>

<Story name="With Selections">
	<QuickPicks
		picks={mixedPicks}
		selectedUrls={['https://example.com/skill1']}
		onTogglePick={() => {}}
	/>
</Story>

<Story name="Occupations Only">
	<QuickPicks picks={SAMPLE_OCCUPATIONS} selectedUrls={[]} onTogglePick={() => {}} />
</Story>
```

## Style Conventions

- Use Tailwind classes directly (no custom CSS)
- Type badges use distinct colors for each CTDL type
- Truncate long names with max-width
- Keep components under 100 lines
- Stories show ResponsivePreview

## Validate

```bash
pnpm turbo check
cd apps/storybook && pnpm test:storybook -- 'src/lib/components/quick-picks/QuickPicks.stories.svelte'
```
