<script lang="ts">
	import { Dialog } from 'bits-ui';

	import JobProfileForm from '$lib/components/job-profile-form/JobProfileForm.svelte';
	import { QuickPicks } from '$lib/components/quick-picks';
	import SelectedSkillsColumn from '$lib/components/selected-skills-column/SelectedSkillsColumn.svelte';
	import { SkillSearch } from '$lib/components/skill-search';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { QUICK_PICKS } from '$lib/config/sample-entities';
	import type {
		CtdlFrameworkSearchResult,
		CtdlSkillContainerSearchResult,
		QuickPickItem,
		Skill,
		SkillSearchSource,
		SkillWithSource
	} from '$lib/types/job-profile';
	import { cn } from '$lib/utils.js';

	import { enhance } from '$app/forms';

	interface Props {
		form?: { error?: string; values?: { name?: string; company?: string; description?: string } };
		/** Storybook / tests: start with skills already selected */
		initialSelectedSkills?: SkillWithSource[];
	}

	let { form, initialSelectedSkills = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	let selectedSkills = $state<SkillWithSource[]>([...initialSelectedSkills]);
	let clientError = $state<string | null>(null);
	let addSkillsOpen = $state(false);

	const skillsJson = $derived(JSON.stringify(selectedSkills));
	const frameworksJson = $derived(JSON.stringify([]));

	const selectedUrls = $derived(selectedSkills.map((s) => s.url));
	const serverError = $derived(form?.error ?? null);

	function skillWithSearchSource(skill: Skill, source?: SkillSearchSource): SkillWithSource {
		if (!source) {
			return { ...skill };
		}
		if (source.kind === 'framework') {
			return {
				...skill,
				sourceCtdlFramework: { name: source.name, '@id': source['@id'] }
			};
		}
		return {
			...skill,
			sourceCtdlContainer: {
				name: source.name,
				'@id': source['@id'],
				'@type': source['@type']
			}
		};
	}

	function handleToggleSkill(skill: Skill, add: boolean, source?: SkillSearchSource) {
		if (add) {
			if (selectedSkills.some((s) => s.url === skill.url)) {
				return;
			}
			selectedSkills = [...selectedSkills, skillWithSearchSource(skill, source)];
		} else {
			selectedSkills = selectedSkills.filter((s) => s.url !== skill.url);
		}
		clientError = null;
	}

	function handleToggleQuickPick(pick: QuickPickItem, skills: Skill[]) {
		if (skills.length === 0) {
			return;
		}
		const removeUrls = skills.map((s) => s.url);
		const allSelected = skills.every((sk) => selectedSkills.some((s) => s.url === sk.url));
		if (allSelected) {
			selectedSkills = selectedSkills.filter((s) => !removeUrls.includes(s.url));
		} else {
			const source: SkillSearchSource | undefined =
				pick.type === 'Skill'
					? undefined
					: pick.type === 'Framework'
						? {
								kind: 'framework',
								name: (pick.entity as CtdlFrameworkSearchResult).name,
								'@id': (pick.entity as CtdlFrameworkSearchResult)['@id']
							}
						: {
								kind: 'container',
								name: (pick.entity as CtdlSkillContainerSearchResult).name,
								'@id': (pick.entity as CtdlSkillContainerSearchResult)['@id'],
								'@type': (pick.entity as CtdlSkillContainerSearchResult)['@type']
							};
			const existingUrls = selectedSkills.map((s) => s.url);
			const additions: SkillWithSource[] = [];
			for (const skill of skills) {
				if (existingUrls.includes(skill.url)) {
					continue;
				}
				existingUrls.push(skill.url);
				additions.push(skillWithSearchSource(skill, source));
			}
			if (additions.length > 0) {
				selectedSkills = [...selectedSkills, ...additions];
			}
		}
		clientError = null;
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
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Create job</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Define the job, then add required skills from the Credential Registry.
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

	<Dialog.Root bind:open={addSkillsOpen}>
		<div class="grid gap-6 @lg:grid-cols-[1fr_340px]">
			<div class="min-w-0 space-y-8">
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

					<div class="border-t border-border pt-6">
						<SelectedSkillsColumn
							{selectedSkills}
							onRemoveSkill={handleRemoveSkill}
							showSource={true}
						/>
					</div>

					<div class="@lg:hidden">
						<Dialog.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'w-full gap-2')}>
							<svg
								class="h-4 w-4 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							Add skills
						</Dialog.Trigger>
					</div>

					<Button type="submit" class="w-full @md:w-auto">Save job</Button>
				</form>
			</div>

			<div class="hidden space-y-6 @lg:block">
				<div class="rounded-lg border border-border bg-card p-4">
					<h2 class="mb-3 text-sm font-semibold text-foreground">Quick picks</h2>
					<QuickPicks picks={QUICK_PICKS} {selectedUrls} onTogglePick={handleToggleQuickPick} />
				</div>

				<div class="rounded-lg border border-border bg-card p-4">
					<h2 class="mb-3 text-sm font-semibold text-foreground">Search</h2>
					<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} />
				</div>
			</div>
		</div>

		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
			<Dialog.Content
				class={cn(
					'fixed top-1/2 left-1/2 z-50 grid max-h-[90vh] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg outline-none'
				)}
			>
				<Dialog.Title class="text-lg leading-none font-semibold tracking-tight">
					Add skills
				</Dialog.Title>
				<div class="mt-2 space-y-6">
					<div>
						<h3 class="mb-3 text-sm font-semibold text-foreground">Quick picks</h3>
						<QuickPicks picks={QUICK_PICKS} {selectedUrls} onTogglePick={handleToggleQuickPick} />
					</div>
					<div class="border-t border-border pt-4">
						<h3 class="mb-3 text-sm font-semibold text-foreground">Search</h3>
						<SkillSearch {selectedUrls} onToggleSkill={handleToggleSkill} />
					</div>
				</div>
				<div class="flex justify-end gap-2 pt-2">
					<Button type="button" onclick={() => (addSkillsOpen = false)}>Done</Button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>
