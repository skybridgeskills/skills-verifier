<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
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
					class="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-border @md:p-4"
				>
					<div class="flex-1">
						{#if skill.label && skill.text}
							<!-- Both label and text present -->
							<div class="font-medium text-foreground">{skill.label}</div>
							<div class="mt-1 text-sm text-muted-foreground">{skill.text}</div>
						{:else if skill.label}
							<!-- Label only -->
							<div class="font-medium text-foreground">{skill.label}</div>
						{:else}
							<!-- Text only (fallback) -->
							<div class="text-foreground">{skill.text}</div>
						{/if}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="opacity-0 transition-opacity group-hover:opacity-100"
						onclick={() => onRemoveSkill(skill)}
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
					</Button>
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
				<p class="mt-1 text-xs text-muted-foreground">
					Add skills using quick picks or the optional framework browser
				</p>
			</CardContent>
		</Card>
	{/if}
</div>
