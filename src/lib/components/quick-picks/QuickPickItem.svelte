<script lang="ts">
	import type { QuickPickItem as QuickPickItemType } from '$lib/types/job-profile';

	interface Props {
		pick: QuickPickItemType;
		isSelected: boolean;
		onClick: () => void;
	}

	let { pick, isSelected, onClick }: Props = $props();

	const typeBadgeClasses: Record<string, string> = {
		Skill: 'bg-flame-subtle text-flame dark:bg-flame-subtle dark:text-flame',
		Job: 'bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary',
		Occupation: 'bg-warmth-subtle text-warmth dark:bg-warmth-subtle dark:text-warmth',
		WorkRole: 'bg-flame-muted text-flame dark:bg-flame-muted dark:text-flame-foreground',
		Task: 'bg-warmth-subtle text-warmth dark:bg-warmth-subtle dark:text-warmth',
		Framework: 'bg-primary-fixed text-primary dark:bg-primary-fixed dark:text-primary'
	};

	const entityName = $derived(
		'name' in pick.entity
			? pick.entity.name
			: (pick.entity.label ?? pick.entity.text ?? pick.entity.ctid)
	);
</script>

<button
	type="button"
	class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90 {isSelected
		? 'bg-primary-fixed text-primary shadow-xs'
		: 'bg-muted text-foreground'}"
	onclick={onClick}
>
	<span
		class="rounded px-1.5 py-0.5 text-xs font-semibold tracking-wider uppercase {typeBadgeClasses[
			pick.type
		] ?? 'bg-accent text-muted-foreground'}"
	>
		{pick.type}
	</span>
	<span class="max-w-[200px] truncate">{entityName}</span>
	{#if isSelected}
		<svg class="h-4 w-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
</button>
