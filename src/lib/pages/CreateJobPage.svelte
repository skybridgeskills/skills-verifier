<script lang="ts">
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import FrameworkSelector from '$lib/components/framework-selector/FrameworkSelector.svelte';
	import SkillsList from '$lib/components/skills-list/SkillsList.svelte';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { FRAMEWORKS } from '$lib/config/frameworks';
	import type { Framework, Skill } from '$lib/types/job-profile';
	import type { FrameworkService } from '$lib/services/framework-service';

	interface Props {
		service: FrameworkService;
	}

	let { service }: Props = $props();

	let selectedFramework = $state<Framework | null>(null);
	let selectedSkills = $state<Skill[]>([]);

	let showSuccess = $state(false);
	let validationError = $state<string | null>(null);

	function handleFrameworkSelect(framework: Framework) {
		selectedFramework = framework;
		// Clear selected skills when framework changes
		selectedSkills = [];
		showSuccess = false;
		validationError = null;
	}

	function handleToggleSkill(skill: Skill) {
		const index = selectedSkills.findIndex((s) => s.url === skill.url);
		if (index >= 0) {
			// Remove skill
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		} else {
			// Add skill
			selectedSkills = [...selectedSkills, skill];
		}
		showSuccess = false;
		validationError = null;
	}

	function handleRemoveSkill(skill: Skill) {
		selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		showSuccess = false;
		validationError = null;
	}

	function handleFormSubmit(data: { name: string; description: string; company: string }) {
		validationError = null;

		// Validate form
		if (!data.name.trim() || !data.description.trim() || !data.company.trim()) {
			validationError = 'Please fill in all required fields';
			return;
		}

		// Validate at least one skill selected
		if (selectedSkills.length === 0) {
			validationError = 'Please select at least one skill';
			return;
		}

		// Validate framework selected
		if (!selectedFramework) {
			validationError = 'Please select a framework';
			return;
		}

		// Job profile created successfully (no persistence yet)
		// In the future, this would persist the job profile:
		// const jobProfile: JobProfile = {
		//   name: data.name,
		//   description: data.description,
		//   company: data.company,
		//   frameworks: [selectedFramework],
		//   skills: selectedSkills,
		// };

		// Show success message
		showSuccess = true;
		validationError = null;

		// Clear success message after 5 seconds
		setTimeout(() => {
			showSuccess = false;
		}, 5000);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Create Job Profile</h1>
		<p class="mt-1 text-sm text-gray-600">
			Select a skills framework and choose the skills needed for this position.
		</p>
	</div>

	<!-- Success Message -->
	{#if showSuccess}
		<div class="rounded-lg border border-green-300 bg-green-50 p-4">
			<div class="flex items-center">
				<svg
					class="mr-2 h-5 w-5 text-green-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-green-800">Job profile saved successfully!</p>
			</div>
		</div>
	{/if}

	<!-- Validation Error -->
	{#if validationError}
		<div class="rounded-lg border border-red-300 bg-red-50 p-4">
			<div class="flex items-center">
				<svg
					class="mr-2 h-5 w-5 text-red-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-red-800">{validationError}</p>
			</div>
		</div>
	{/if}

	<!-- Job Profile Form -->
	<div>
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Job Information</h2>
		<JobProfileForm onSubmit={handleFormSubmit} />
	</div>

	<!-- Framework Selection -->
	<div>
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Select Framework</h2>
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleFrameworkSelect} />
	</div>

	<!-- Skills Selection - Two Column Layout -->
	{#if selectedFramework}
		<div>
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Select Skills</h2>
			<div class="grid grid-cols-1 gap-6 @lg:grid-cols-2">
				<!-- Left Column: Skills List -->
				<div>
					<SkillsList
						framework={selectedFramework}
						selectedSkills={selectedSkills.map((s) => s.url)}
						onToggleSkill={handleToggleSkill}
						{service}
					/>
				</div>

				<!-- Right Column: Selected Skills -->
				<div>
					<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
				</div>
			</div>
		</div>
	{/if}
</div>
