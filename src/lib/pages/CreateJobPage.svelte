<script lang="ts">
	import {
		createFrameworkService,
		type FrameworkClient
	} from '$lib/clients/framework-client/framework-client';
	import FrameworkSelector from '$lib/components/framework-selector/FrameworkSelector.svelte';
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import QuickSkillPicks from '$lib/components/quick-skill-picks/QuickSkillPicks.svelte';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import SkillsList from '$lib/components/skills-list/SkillsList.svelte';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FRAMEWORKS } from '$lib/config/frameworks';
	import { SAMPLE_SKILLS } from '$lib/config/sample-skills';
	import type { Framework, Skill } from '$lib/types/job-profile';

	import { enhance } from '$app/forms';

	interface Props {
		service?: FrameworkClient;
		form?: { error?: string; values?: { name?: string; company?: string; description?: string } };
	}

	let { service: serviceOverride, form }: Props = $props();

	const service = $derived(serviceOverride ?? createFrameworkService());

	let selectedFramework = $state<Framework | null>(null);
	let selectedSkills = $state<Skill[]>([]);

	let clientError = $state<string | null>(null);

	const skillsJson = $derived(JSON.stringify(selectedSkills));
	const frameworksJson = $derived(
		JSON.stringify(
			selectedFramework
				? [
						{
							name: selectedFramework.name,
							organization: selectedFramework.organization,
							url: selectedFramework.url,
							ctid: selectedFramework.ctid
						}
					]
				: []
		)
	);

	const serverError = $derived(form?.error ?? null);

	function handleFrameworkSelect(framework: Framework) {
		selectedFramework = framework;
		selectedSkills = [];
		clientError = null;
	}

	function handleToggleSkill(skill: Skill) {
		const index = selectedSkills.findIndex((s) => s.url === skill.url);
		if (index >= 0) {
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		} else {
			selectedSkills = [...selectedSkills, skill];
		}
		clientError = null;
	}

	function handleRemoveSkill(skill: Skill) {
		selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		clientError = null;
	}

	function validateClient(): boolean {
		if (selectedSkills.length === 0) {
			clientError = 'Select at least one skill (quick picks or framework browser).';
			return false;
		}
		clientError = null;
		return true;
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Create job</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Add required skills first. Browsing a competency framework is optional metadata for this job.
		</p>
	</div>

	{#if serverError}
		<Alert variant="destructive">
			<AlertTitle>Could not save job</AlertTitle>
			<AlertDescription>{serverError}</AlertDescription>
		</Alert>
	{/if}

	{#if clientError}
		<Alert variant="destructive">
			<AlertTitle>Validation</AlertTitle>
			<AlertDescription>{clientError}</AlertDescription>
		</Alert>
	{/if}

	<form
		method="POST"
		action="?/createJob"
		use:enhance={({ cancel }) => {
			if (!validateClient()) {
				cancel();
			}
		}}
		class="space-y-8"
	>
		<input type="hidden" name="skillsJson" value={skillsJson} />
		<input type="hidden" name="frameworksJson" value={frameworksJson} />

		<div>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Job information</h2>
			<JobProfileForm embedded />
		</div>

		<div>
			<h2 class="mb-2 text-lg font-semibold text-foreground">Quick skill picks</h2>
			<p class="mb-4 text-sm text-muted-foreground">
				Add skills without choosing a framework, or use the browser below.
			</p>
			<QuickSkillPicks
				skills={SAMPLE_SKILLS}
				selectedUrls={selectedSkills.map((s) => s.url)}
				onToggleSkill={handleToggleSkill}
			/>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-semibold text-foreground">Optional: browse a framework</h2>
			<p class="mb-4 text-sm text-muted-foreground">
				Load skills from Credential Engine–style frameworks for richer labels and CTIDs.
			</p>
			<FrameworkSelector
				frameworks={FRAMEWORKS}
				onSelect={handleFrameworkSelect}
				{selectedFramework}
			/>
		</div>

		{#if selectedFramework}
			<div>
				<h2 class="mb-4 text-lg font-semibold text-foreground">Skills from framework</h2>
				<div class="grid grid-cols-1 gap-6 @lg:grid-cols-2">
					<div>
						<SkillsList
							framework={selectedFramework}
							selectedSkills={selectedSkills.map((s) => s.url)}
							onToggleSkill={handleToggleSkill}
							{service}
						/>
					</div>
					<div>
						<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
					</div>
				</div>
			</div>
		{:else}
			<div>
				<h2 class="mb-4 text-lg font-semibold text-foreground">Selected skills</h2>
				<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
			</div>
		{/if}

		<Button type="submit" class="w-full @md:w-auto">Save job</Button>
	</form>
</div>
