# Phase 4: Update CreateJobPage

## Scope of phase

- Update `CreateJobPage.svelte` — Remove FrameworkSelector and SkillsList, add SkillSearch
- Simplify state management (remove `selectedFramework`)
- Keep QuickSkillPicks and SelectedSkillsColumn
- Update layout: simpler, skills-first flow

## Code Organization Reminders

- Update imports (remove old, add new)
- Simplify state: remove framework-related
- Update props interface if needed
- Test form submission still works

## Style conventions

- **Layout** — Cleaner spacing, no complex conditional for framework
- **Section headings** — Clear hierarchy
- **Svelte 5** — Use existing patterns in file

## Implementation Details

### 4.1 Update `src/lib/pages/CreateJobPage.svelte`

**Before changes (current state):**

```svelte
<script lang="ts">
	// ... imports include FrameworkSelector, SkillsList
	let selectedFramework = $state<Framework | null>(null);
	let selectedSkills = $state<Skill[]>([]);
	// ... framework selection handlers
</script>

<!-- Old layout with FrameworkSelector and conditional SkillsList -->
```

**After changes:**

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import QuickSkillPicks from '$lib/components/quick-skill-picks/QuickSkillPicks.svelte';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { SkillSearch } from '$lib/components/skill-search';
	import { SAMPLE_SKILLS } from '$lib/config/sample-skills';
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		form?: { error?: string; values?: { name?: string; company?: string; description?: string } };
	}

	let { form }: Props = $props();

	// State
	let selectedSkills = $state<Skill[]>([]);
	let clientError = $state<string | null>(null);

	// Derived
	const skillsJson = $derived(JSON.stringify(selectedSkills));
	const serverError = $derived(form?.error ?? null);

	// Get selected URLs for child components
	const selectedUrls = $derived(selectedSkills.map((s) => s.url));

	// Handlers
	function handleAddSkill(skill: Skill) {
		// Prevent duplicates
		if (!selectedUrls.includes(skill.url)) {
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
			Add required skills to the job. Search from Credential Engine or pick from quick suggestions.
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
		<!-- Note: frameworksJson removed - backend may need update to make it optional -->

		<div>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Job information</h2>
			<JobProfileForm embedded />
		</div>

		<div class="grid gap-6 @lg:grid-cols-2">
			<!-- Left column: Skill discovery -->
			<div class="space-y-6">
				<!-- Quick picks -->
				<div>
					<h2 class="mb-2 text-lg font-semibold text-foreground">Quick skill picks</h2>
					<p class="mb-4 text-sm text-muted-foreground">Common skills you can add quickly.</p>
					<QuickSkillPicks skills={SAMPLE_SKILLS} {selectedUrls} onToggleSkill={handleAddSkill} />
				</div>

				<!-- Search -->
				<div>
					<h2 class="mb-2 text-lg font-semibold text-foreground">Search for skills</h2>
					<p class="mb-4 text-sm text-muted-foreground">
						Search Credential Engine for specific skills by keyword.
					</p>
					<SkillSearch {selectedUrls} onSelect={handleAddSkill} />
				</div>
			</div>

			<!-- Right column: Selected skills -->
			<div>
				<h2 class="mb-4 text-lg font-semibold text-foreground">
					Selected skills ({selectedSkills.length})
				</h2>
				<SelectedSkillsColumn {selectedSkills} onRemoveSkill={handleRemoveSkill} />
			</div>
		</div>

		<Button type="submit" class="w-full @md:w-auto">Save job</Button>
	</form>
</div>
```

### 4.2 Backend compatibility note

The form submission changed:

- Removed `frameworksJson` hidden input
- Backend may need to handle missing `frameworksJson` (if currently required)
- Check `src/routes/jobs/create/+page.server.ts` and action handler

If backend needs update, add to this phase or create follow-up.

### 4.3 Update `src/routes/jobs/create/+page.server.ts` if needed

Find the action handler and check if `frameworksJson` is required:

```typescript
// Before:
const skillsJson = formData.get('skillsJson');
const frameworksJson = formData.get('frameworksJson'); // May be required

// After (if making optional):
const skillsJson = formData.get('skillsJson');
const frameworksJson = formData.get('frameworksJson') ?? '[]'; // Default to empty
```

## Tests

Manual/Playwright tests:

1. Page loads without errors
2. QuickSkillPicks adds skills
3. SkillSearch searches and adds skills
4. SelectedSkillsColumn shows and removes skills
5. Form validates (at least one skill required)
6. Form submits successfully

## Validate

```bash
pnpm check
pnpm dev  # Manual test in browser
# Or if Playwright tests exist:
# pnpm e2e:playwright
```

Verify:

- TypeScript compiles
- No console errors on page load
- SkillSearch component loads
- Form submission works
