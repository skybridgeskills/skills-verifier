<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		selectedSkills: Skill[];
		onRemoveSkill: (skill: Skill) => void;
	}

	let { selectedSkills, onRemoveSkill }: Props = $props();

	const skillCount = $derived(selectedSkills.length);
	const showWarning = $derived(skillCount > 10);
</script>

<div class="space-y-4">
	<!-- Header -->
	<div>
		<h2 class="text-lg font-semibold text-gray-900">Selected Skills</h2>
		<p class="mt-1 text-sm text-gray-600">
			We recommend selecting 5-10 of the most important skills.
		</p>
	</div>

	<!-- Warning if >10 skills -->
	{#if showWarning}
		<div class="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
			<div class="flex items-start">
				<svg
					class="mr-2 h-5 w-5 flex-shrink-0 text-yellow-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div class="flex-1">
					<p class="text-sm font-medium text-yellow-800">
						You have selected {skillCount} skills
					</p>
					<p class="mt-1 text-sm text-yellow-700">
						Consider focusing on the most important 5-10 skills for better clarity.
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Skills List -->
	{#if selectedSkills.length > 0}
		<div class="space-y-2">
			{#each selectedSkills as skill (skill.url)}
				<div
					class="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 @md:p-4"
				>
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
					<button
						type="button"
						onclick={() => onRemoveSkill(skill)}
						class="ml-2 flex-shrink-0 rounded-md p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
						aria-label="Remove skill"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<p class="mt-2 text-sm text-gray-600">No skills selected yet</p>
			<p class="mt-1 text-xs text-gray-500">Select skills from the framework to add them here</p>
		</div>
	{/if}
</div>
