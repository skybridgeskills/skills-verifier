<script lang="ts">
	import { SkillItem } from '$lib/components/skill-item/index.js';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import type { Skill, SkillWithSource } from '$lib/types/job-profile';

	interface Props {
		selectedSkills: SkillWithSource[];
		onRemoveSkill: (skill: Skill) => void;
		showSource?: boolean;
	}

	let { selectedSkills, onRemoveSkill, showSource = false }: Props = $props();

	const skillCount = $derived(selectedSkills.length);
	const showWarning = $derived(skillCount > 10);

	function removeLabel(skill: Skill): string {
		return skill.label?.trim() || skill.text?.trim() || skill.ctid;
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<div>
		<h2 class="text-lg font-semibold text-foreground">Selected Skills</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			We recommend selecting 5-10 of the most important skills.
		</p>
	</div>

	<!-- Warning if >10 skills -->
	{#if showWarning}
		<Alert variant="default" class="border-yellow-300 bg-yellow-50">
			<AlertTitle class="text-yellow-800">You have selected {skillCount} skills</AlertTitle>
			<AlertDescription class="text-yellow-700">
				Consider focusing on the most important 5-10 skills for better clarity.
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Skills List -->
	{#if selectedSkills.length > 0}
		<div class="space-y-2">
			{#each selectedSkills as skill (skill.url)}
				<div
					class="group flex w-full items-start justify-between gap-3 rounded-lg border border-green-600/30 bg-green-600/10 px-4 py-3 text-left transition-colors focus-within:border-primary/50 focus-within:bg-accent/40"
				>
					<div class="min-w-0 flex-1">
						<SkillItem {skill} />
						{#if showSource && skill.sourceCtdlContainer}
							<p class="mt-1 text-xs text-muted-foreground">
								From {skill.sourceCtdlContainer['@type']}: {skill.sourceCtdlContainer.name}
							</p>
						{:else if showSource && skill.sourceCtdlFramework}
							<p class="mt-1 text-xs text-muted-foreground">
								From framework: {skill.sourceCtdlFramework.name}
							</p>
						{/if}
					</div>
					<button
						type="button"
						class="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-red-600 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-red-50 focus-visible:z-10 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:outline-none dark:text-red-400 dark:hover:bg-red-950/30"
						onclick={() => onRemoveSkill(skill)}
						aria-label="Remove {removeLabel(skill)}"
					>
						<svg
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						<span>Remove</span>
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center p-8 text-center">
				<svg
					class="mx-auto h-12 w-12 text-muted-foreground"
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
				<p class="mt-2 text-sm text-muted-foreground">No skills selected yet</p>
				<p class="mt-1 text-xs text-muted-foreground">Use quick picks or search to add skills.</p>
				<p class="mt-1 text-xs text-muted-foreground @lg:hidden">
					Tap <strong class="font-medium">Add skills</strong> below.
				</p>
				<p class="mt-1 hidden text-xs text-muted-foreground @lg:block">
					Use the <strong class="font-medium">Add skills</strong> panel on the right.
				</p>
			</CardContent>
		</Card>
	{/if}
</div>
