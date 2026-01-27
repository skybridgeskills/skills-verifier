<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
		selected: boolean;
		onToggle: (url: string) => void;
	}

	let { skill, selected, onToggle }: Props = $props();

	function handleClick() {
		onToggle(skill.url);
	}
</script>

{#if skill}
	<label
		class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors @md:p-4 {selected
			? 'border-blue-500 bg-blue-50'
			: 'border-gray-200 bg-white hover:border-gray-300'}"
	>
		<input
			type="checkbox"
			checked={selected}
			onchange={handleClick}
			class="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
		/>
		<div class="flex-1">
			{#if skill.label && skill.text}
				<!-- Both label and text present -->
				<div class="font-medium text-gray-900">{skill.label}</div>
				<div class="mt-1 text-sm text-gray-600">{skill.text}</div>
			{:else if skill.label}
				<!-- Label only -->
				<div class="font-medium text-gray-900">{skill.label}</div>
			{:else}
				<!-- Text only (fallback) -->
				<div class="text-gray-900">{skill.text}</div>
			{/if}
		</div>
	</label>
{/if}
