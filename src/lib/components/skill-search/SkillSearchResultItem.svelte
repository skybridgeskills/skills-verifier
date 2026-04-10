<script lang="ts">
	import { SkillItem } from '$lib/components/skill-item/index.js';
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
		isSelected: boolean;
		onToggle: () => void;
		/** Optional provenance (e.g. when showing context from a container search). */
		sourceNote?: string;
	}

	let { skill, isSelected, onToggle, sourceNote }: Props = $props();

	const displayTitle = $derived(skill.label?.trim() || skill.text?.trim() || skill.ctid);
</script>

<!-- Inert card: only internal buttons perform actions; focus ring when a control is focused -->
<div
	class="group flex w-full items-start justify-between gap-3 rounded-xl px-4 py-3 text-left shadow-ambient transition-colors focus-within:ring-2 focus-within:ring-ring/25 {isSelected
		? 'bg-primary-fixed ring-2 ring-primary/20'
		: 'bg-card hover:bg-secondary'}"
>
	<div class="min-w-0 flex-1">
		<SkillItem {skill} />
		{#if sourceNote}
			<p class="mt-1 text-xs text-muted-foreground">{sourceNote}</p>
		{/if}
	</div>
	{#if isSelected}
		<div
			class="relative grid shrink-0 place-items-end justify-items-end [&>*]:col-start-1 [&>*]:row-start-1"
		>
			<div
				class="pointer-events-none flex items-center gap-1 text-primary transition-opacity group-focus-within:opacity-0 group-hover:opacity-0"
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
			<button
				type="button"
				class="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-destructive opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-destructive/10 focus-visible:z-10 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-destructive/25 focus-visible:ring-offset-0 focus-visible:outline-none dark:hover:bg-destructive/20"
				onclick={onToggle}
				aria-label="Remove {displayTitle}"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				<span>Remove</span>
			</button>
		</div>
	{:else}
		<button
			type="button"
			class="shrink-0 rounded-md p-1 text-primary transition-colors hover:bg-accent/60 hover:text-primary/80 focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
			onclick={onToggle}
			aria-label="Add {displayTitle}"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	{/if}
</div>
