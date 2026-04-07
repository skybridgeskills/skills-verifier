<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
		isSelected: boolean;
		onSelect: () => void;
	}

	let { skill, isSelected, onSelect }: Props = $props();

	const title = $derived(skill.label ?? skill.text);
	const subtitle = $derived(
		skill.label && skill.text && skill.text !== skill.label ? skill.text : null
	);

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
	<div
		class="flex items-start justify-between gap-3 rounded-lg border border-green-600/30 bg-green-600/10 px-4 py-3"
		aria-label="{title} — already added"
	>
		<div class="min-w-0 flex-1">
			<div class="font-medium text-foreground">{title}</div>
			{#if subtitle}
				<p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
			{/if}
			{#if skill.ctid}
				<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-1 text-green-700 dark:text-green-400">
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
	<button
		type="button"
		class="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		aria-label="Add {title}"
	>
		<div class="min-w-0 flex-1">
			<div class="font-medium text-foreground">{title}</div>
			{#if subtitle}
				<p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
			{/if}
			{#if skill.ctid}
				<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
			{/if}
		</div>
		<div class="shrink-0 text-primary" aria-hidden="true">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</div>
	</button>
{/if}
