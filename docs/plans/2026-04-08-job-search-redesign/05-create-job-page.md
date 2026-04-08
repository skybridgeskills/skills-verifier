# Phase 5: CreateJobPage Layout Restructure

## Scope

Restructure the CreateJobPage with the new layout: job form first, selected skills below, search in sidebar (desktop) / dialog (mobile).

## Implementation

### 1. Update `src/lib/pages/CreateJobPage.svelte`

New layout structure:

```svelte
<script lang="ts">
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import { QuickPicks } from '$lib/components/quick-picks';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { SkillSearch } from '$lib/components/skill-search';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog/index.js';
	import { QUICK_PICKS } from '$lib/config/sample-entities';
	import type { Skill, SkillWithSource, QuickPickItem } from '$lib/types/job-profile';

	import { enhance } from '$app/forms';

	interface Props {
		form?: { error?: string; values?: { name?: string; company?: string; description?: string } };
	}

	let { form }: Props = $props();

	let selectedSkills = $state<SkillWithSource[]>([]);
	let clientError = $state<string | null>(null);
	let searchDialogOpen = $state(false); // Mobile dialog state

	const skillsJson = $derived(JSON.stringify(selectedSkills));
	const frameworksJson = $derived(JSON.stringify([]));
	const selectedUrls = $derived(selectedSkills.map((s) => s.url));
	const serverError = $derived(form?.error ?? null);

	function handleToggleSkill(
		skill: Skill,
		add: boolean,
		source?: { name: string; '@type': string; '@id': string }
	) {
		if (add) {
			if (!selectedUrls.includes(skill.url)) {
				const skillWithSource: SkillWithSource = source
					? {
							...skill,
							sourceCtdlContainer: {
								name: source.name,
								'@type': source['@type'],
								'@id': source['@id']
							}
						}
					: skill;
				selectedSkills = [...selectedSkills, skillWithSource];
			}
		} else {
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		}
		clientError = null;
	}

	function handleToggleQuickPick(pick: QuickPickItem, skills: Skill[]) {
		// Add all skills from the pick
		skills.forEach((skill) => {
			if (!selectedUrls.includes(skill.url)) {
				const source =
					pick.type !== 'Skill'
						? { name: pick.entity.name, '@type': pick.type, '@id': pick.entity['@id'] }
						: undefined;
				handleToggleSkill(skill, true, source);
			}
		});
	}

	function handleRemoveSkill(skill: Skill) {
		selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		clientError = null;
	}

	function validateClient(): boolean {
		if (selectedSkills.length === 0) {
			clientError = 'Select at least one skill.';
			return false;
		}
		clientError = null;
		return true;
	}

	function handleSearchDialogToggleSkill(skill: Skill, add: boolean) {
		handleToggleSkill(skill, add);
		// Don't close dialog on single add - let user add multiple
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-foreground">Create Job</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Define the job and select required skills from the Credential Registry.
		</p>
	</div>

	<!-- Error alerts -->
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

	<!-- Main Grid Layout -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Left Column: Job Form + Selected Skills -->
		<div class="space-y-8">
			<!-- Job Information Form -->
			<form
				method="POST"
				action="?/createJob"
				use:enhance={({ cancel }) => {
					if (!validateClient()) cancel();
				}}
				class="space-y-6"
			>
				<input type="hidden" name="skillsJson" value={skillsJson} />
				<input type="hidden" name="frameworksJson" value={frameworksJson} />

				<div>
					<h2 class="mb-4 text-lg font-semibold text-foreground">Job Information</h2>
					<JobProfileForm embedded />
				</div>

				<!-- Selected Skills (moved inside form but visually separate) -->
				<div class="border-t border-border pt-6">
					<SelectedSkillsColumn
						{selectedSkills}
						onRemoveSkill={handleRemoveSkill}
						showSource={true}
					/>
				</div>

				<!-- Mobile: Search Dialog Trigger -->
				<div class="lg:hidden">
					<Dialog bind:open={searchDialogOpen}>
						<DialogTrigger asChild>
							<Button type="button" variant="outline" class="w-full">
								<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								Add Skills
							</Button>
						</DialogTrigger>
						<DialogContent class="max-h-[90vh] max-w-lg overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add Skills</DialogTitle>
							</DialogHeader>
							<div class="mt-4 space-y-6">
								<!-- Quick Picks (mobile dialog) -->
								<div>
									<h3 class="mb-3 text-sm font-semibold">Quick Picks</h3>
									<QuickPicks
										picks={QUICK_PICKS}
										{selectedUrls}
										onTogglePick={handleToggleQuickPick}
									/>
								</div>
								<!-- Search Interface (mobile dialog) -->
								<div class="border-t border-border pt-4">
									<h3 class="mb-3 text-sm font-semibold">Search</h3>
									<SkillSearch {selectedUrls} onToggleSkill={handleSearchDialogToggleSkill} />
								</div>
							</div>
							<div class="mt-6 flex justify-end gap-2">
								<Button onclick={() => (searchDialogOpen = false)}>Done</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				<Button type="submit" class="w-full @md:w-auto">Save Job</Button>
			</form>
		</div>

		<!-- Right Column: Search Sidebar (Desktop Only) -->
		<div class="hidden space-y-6 lg:block">
			<!-- Quick Picks -->
			<div class="rounded-lg border border-border bg-card p-4">
				<h2 class="mb-3 text-sm font-semibold">Quick Picks</h2>
				<QuickPicks picks={QUICK_PICKS} {selectedUrls} onTogglePick={handleToggleQuickPick} />
			</div>

			<!-- Search Interface -->
			<div class="rounded-lg border border-border bg-card p-4">
				<h2 class="mb-3 text-sm font-semibold">Search</h2>
				<SkillSearch {selectedUrls} onToggleSkill={(skill, add) => handleToggleSkill(skill, add)} />
			</div>
		</div>
	</div>
</div>
```

### 2. Update `src/lib/components/selected-skills-column/SelectedSkillsColumn.svelte`

Add optional source display:

```svelte
<script lang="ts">
	// ... existing imports
	import type { SkillWithSource } from '$lib/types/job-profile';

	interface Props {
		selectedSkills: SkillWithSource[];
		onRemoveSkill: (skill: Skill) => void;
		showSource?: boolean; // NEW
	}

	let { selectedSkills, onRemoveSkill, showSource = false }: Props = $props();
	// ... rest
</script>

<!-- In the skill item display, add source info -->
{#if showSource && skill.sourceCtdlContainer}
	<p class="mt-0.5 text-xs text-muted-foreground">
		From {skill.sourceCtdlContainer['@type']}: {skill.sourceCtdlContainer.name}
	</p>
{/if}
```

### 3. Update stories

`CreateJobPage.stories.svelte` with desktop and mobile variants.

## Style Conventions

- Use container query `@lg:grid-cols-2` for responsive grid
- Mobile dialog uses `max-h-[90vh]` for scrollability
- Form nesting is correct: no nested forms (search is outside main form)
- Selected skills show source when added from CTDL container

## Validate

```bash
pnpm turbo check
cd apps/storybook && pnpm test:storybook -- 'src/lib/pages/CreateJobPage.stories.svelte'
```
