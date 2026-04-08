<script lang="ts">
	import { SkillItem } from '$lib/components/skill-item/index.js';
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
		isSelected: boolean;
		onToggle: () => void;
	}

	let { skill, isSelected, onToggle }: Props = $props();

	const displayTitle = $derived(skill.label?.trim() || skill.text?.trim() || skill.ctid);

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onToggle();
		}
	}
</script>

<button
	type="button"
	class="group flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none {isSelected
		? 'border-green-600/30 bg-green-600/10'
		: 'border-border bg-card hover:border-primary/50 hover:bg-accent/40'}"
	onclick={onToggle}
	onkeydown={handleKeyDown}
	aria-label={isSelected ? `Remove ${displayTitle}` : `Add ${displayTitle}`}
>
	<SkillItem {skill} />
	{#if isSelected}
		<!-- Default: show Added; on hover: show Remove -->
		<div
			class="flex shrink-0 items-center gap-1 text-green-700 transition-opacity group-hover:opacity-0 dark:text-green-400"
			aria-hidden="true"
		>
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
			<span class="text-sm font-medium">Added</span>
		</div>
		<div
			class="flex shrink-0 items-center gap-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-red-400"
			aria-hidden="true"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
			<span class="text-sm font-medium">Remove</span>
		</div>
	{:else}
		<div class="shrink-0 text-primary" aria-hidden="true">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</div>
	{/if}
</button>
