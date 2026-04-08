<script lang="ts">
	import type { QuickPickItem as QuickPickItemType } from '$lib/types/job-profile';

	interface Props {
		pick: QuickPickItemType;
		isSelected: boolean;
		onClick: () => void;
	}

	let { pick, isSelected, onClick }: Props = $props();

	// Type badge color mapping
	const typeBadgeClasses: Record<string, string> = {
		Skill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
		Job: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
		Occupation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
		WorkRole: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
		Task: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
		Framework: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
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
		: 'border-border bg-card'}"
	onclick={onClick}
>
	<span
		class="text-xs font-semibold tracking-wider uppercase {typeBadgeClasses[pick.type] ??
			'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'} rounded px-1.5 py-0.5"
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
