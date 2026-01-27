<script lang="ts">
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import FrameworkSelector from '$lib/components/framework-selector/FrameworkSelector.svelte';
	import SkillsList from '$lib/components/skills-list/SkillsList.svelte';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
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
		<h1 class="text-2xl font-bold text-foreground">Create Job Profile</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Select a skills framework and choose the skills needed for this position.
		</p>
	</div>

	<!-- Success Message -->
	{#if showSuccess}
		<Alert variant="default" class="border-green-300 bg-green-50">
			<AlertTitle class="text-green-800">Job profile saved successfully!</AlertTitle>
		</Alert>
	{/if}

	<!-- Validation Error -->
	{#if validationError}
		<Alert variant="destructive">
			<AlertTitle>Validation Error</AlertTitle>
			<AlertDescription>{validationError}</AlertDescription>
		</Alert>
	{/if}

	<!-- Job Profile Form -->
	<div>
		<h2 class="mb-4 text-lg font-semibold text-foreground">Job Information</h2>
		<JobProfileForm onSubmit={handleFormSubmit} />
	</div>

	<!-- Framework Selection -->
	<div>
		<h2 class="mb-4 text-lg font-semibold text-foreground">Select Framework</h2>
		<FrameworkSelector
			frameworks={FRAMEWORKS}
			onSelect={handleFrameworkSelect}
			{selectedFramework}
		/>
	</div>

	<!-- Skills Selection - Two Column Layout -->
	{#if selectedFramework}
		<div>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Select Skills</h2>
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
