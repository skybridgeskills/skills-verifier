# Phase 2: SkillSearchResultItem component

## Scope of phase

- Create `SkillSearchResultItem.svelte` — Single clickable result with selection state
- Create stories for Storybook testing
- Component displays skill name, optional description, CTID badge, and "Added" state

## Code Organization Reminders

- One component per file
- Co-locate `.stories.svelte` file
- Props interface at top of script
- Helper functions at bottom

## Style conventions

- **shadcn-svelte** — Use existing Button, Badge components if available
- **Svelte 5** — `$props()` for props, no export let
- **Accessibility** — Clickable via button or proper role, keyboard support
- **States** — Default, hover, selected (disabled), focus

## Implementation Details

### 2.1 Create `src/lib/components/skill-search/SkillSearchResultItem.svelte`

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
		isSelected: boolean;
		onSelect: () => void;
	}

	let { skill, isSelected, onSelect }: Props = $props();

	function handleClick() {
		if (!isSelected) {
			onSelect();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

{#if isSelected}
	<!-- Selected state: non-clickable, shows checkmark -->
	<div
		class="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3"
		aria-label="{skill.name} - already added"
	>
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<span class="font-medium text-green-900">{skill.name}</span>
				{#if skill.ctid}
					<span class="text-xs text-green-600">({skill.ctid})</span>
				{/if}
			</div>
			{#if skill.description}
				<p class="text-sm text-green-700">{skill.description}</p>
			{/if}
		</div>
		<div class="flex items-center gap-1 text-green-700">
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
			<span class="text-sm font-medium">Added</span>
		</div>
	</div>
{:else}
	<!-- Unselected state: clickable -->
	<button
		type="button"
		class="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		aria-label="Add {skill.name}"
	>
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<span class="font-medium text-gray-900">{skill.name}</span>
				{#if skill.ctid}
					<span class="text-xs text-gray-500">({skill.ctid})</span>
				{/if}
			</div>
			{#if skill.description}
				<p class="text-sm text-gray-600">{skill.description}</p>
			{/if}
		</div>
		<div class="flex items-center text-blue-600">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span class="sr-only">Add skill</span>
		</div>
	</button>
{/if}
```

### 2.2 Create `src/lib/components/skill-search/SkillSearchResultItem.stories.svelte`

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	const { Story } = defineMeta({
		title: 'Components/SkillSearch/SkillSearchResultItem',
		component: SkillSearchResultItem,
		argTypes: {
			isSelected: { control: 'boolean' }
		}
	});
</script>

<Story
	name="Default"
	args={{
		skill: {
			name: 'JavaScript Programming',
			url: 'https://example.com/skills/js',
			ctid: 'ce-js-prog',
			description: 'Writing and maintaining JavaScript code for web applications'
		},
		isSelected: false,
		onSelect: () => alert('Skill selected!')
	}}
/>

<Story
	name="Selected"
	args={{
		skill: {
			name: 'JavaScript Programming',
			url: 'https://example.com/skills/js',
			ctid: 'ce-js-prog',
			description: 'Writing and maintaining JavaScript code for web applications'
		},
		isSelected: true,
		onSelect: () => {}
	}}
/>

<Story
	name="No CTID"
	args={{
		skill: {
			name: 'Project Management',
			url: 'https://example.com/skills/pm',
			description: 'Managing projects and teams effectively'
		},
		isSelected: false,
		onSelect: () => alert('Skill selected!')
	}}
/>

<Story
	name="No Description"
	args={{
		skill: {
			name: 'TypeScript',
			url: 'https://example.com/skills/ts',
			ctid: 'ce-ts'
		},
		isSelected: false,
		onSelect: () => alert('Skill selected!')
	}}
/>

<Story
	name="Minimal"
	args={{
		skill: {
			name: 'React',
			url: 'https://example.com/skills/react'
		},
		isSelected: false,
		onSelect: () => alert('Skill selected!')
	}}
/>
```

## Tests

Component behavior tested via stories and usage in parent component.

## Validate

```bash
pnpm check
pnpm build:storybook  # Verify stories compile
```

Verify:

- Component compiles without errors
- Stories render correctly
- Types are correct (Skill interface with all fields)
