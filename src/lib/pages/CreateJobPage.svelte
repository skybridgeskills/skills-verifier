<script lang="ts">
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import QuickSkillPicks from '$lib/components/quick-skill-picks/QuickSkillPicks.svelte';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { SkillSearch } from '$lib/components/skill-search';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { SAMPLE_SKILLS } from '$lib/config/sample-skills';
	import type { Skill } from '$lib/types/job-profile';

	import { enhance } from '$app/forms';

	interface Props {
		form?: { error?: string; values?: { name?: string; company?: string; description?: string } };
	}

	let { form }: Props = $props();

	let selectedSkills = $state<Skill[]>([]);
	let clientError = $state<string | null>(null);

	const skillsJson = $derived(JSON.stringify(selectedSkills));
	/** Job create action still accepts frameworks; none selected from this flow. */
	const frameworksJson = $derived(JSON.stringify([]));

	const selectedUrls = $derived(selectedSkills.map((s) => s.url));
	const serverError = $derived(form?.error ?? null);

	function handleToggleSkill(skill: Skill) {
		const index = selectedSkills.findIndex((s) => s.url === skill.url);
		if (index >= 0) {
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		} else {
			selectedSkills = [...selectedSkills, skill];
		}
		clientError = null;
	}

	function handleToggleSkillFromSearch(skill: Skill, add: boolean) {
		if (add) {
			if (!selectedUrls.includes(skill.url)) {
				selectedSkills = [...selectedSkills, skill];
			}
		} else {
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		}
		clientError = null;
	}

	function handleRemoveSkill(skill: Skill) {
		selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		clientError = null;
	}

	function validateClient(): boolean {
		if (selectedSkills.length === 0) {
			clientError = 'Select at least one skill from quick picks or search.';
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
			Add required skills. Search Credential Engine or use quick suggestions.
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

		<div class="grid gap-6 @lg:grid-cols-2">
			<div class="space-y-6">
				<div>
					<h2 class="mb-2 text-lg font-semibold text-foreground">Quick skill picks</h2>
					<p class="mb-4 text-sm text-muted-foreground">Common skills you can add in one click.</p>
					<QuickSkillPicks
						skills={SAMPLE_SKILLS}
						{selectedUrls}
						onToggleSkill={handleToggleSkill}
					/>
				</div>

				<div>
					<h2 class="mb-2 text-lg font-semibold text-foreground">Search for skills</h2>
					<p class="mb-4 text-sm text-muted-foreground">
						Search Credential Engine for competencies by keyword.
					</p>
					<SkillSearch {selectedUrls} onToggle={handleToggleSkillFromSearch} />
				</div>
			</div>

			<div>
				<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
			</div>
		</div>

		<Button type="submit" class="w-full @md:w-auto">Save job</Button>
	</form>
</div>
