<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { FrameworkClient } from '$lib/server/clients/framework-client/framework-client';
	import type { Framework, Skill } from '$lib/types/job-profile';

	import SkillItem from '../skill-item/SkillItem.svelte';

	interface Props {
		framework: Framework | null;
		selectedSkills: string[];
		onToggleSkill: (skill: Skill) => void;
		service: FrameworkClient;
	}

	let { framework, selectedSkills, onToggleSkill, service }: Props = $props();

	let skills = $state<Skill[]>([]);
	let loadingFramework = $state(false);
	let loadingSkills = $state(false);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// Fetch skills when framework changes
	$effect(() => {
		if (framework) {
			loadSkills();
		} else {
			skills = [];
			error = null;
		}
	});

	async function loadSkills() {
		if (!framework) return;

		skills = [];
		error = null;
		loadingFramework = true;
		loadingSkills = false;

		try {
			// Fetch framework to get skill URLs
			const frameworkResponse = await service.fetchFramework(framework.url);
			loadingFramework = false;
			loadingSkills = true;

			// Fetch all skills in parallel
			const skillPromises = frameworkResponse.skillUrls.map((url) =>
				service.fetchSkill(url).catch((err) => {
					console.error(`Failed to fetch skill ${url}:`, err);
					return null; // Return null for failed fetches
				})
			);

			const skillResponses = await Promise.all(skillPromises);
			const loadedSkills = skillResponses
				.filter((response): response is { skill: Skill } => response !== null)
				.map((response) => response.skill);

			skills = loadedSkills;
			loadingSkills = false;

			if (loadedSkills.length === 0) {
				error = 'No skills could be loaded from this framework';
			}
		} catch (err) {
			loadingFramework = false;
			loadingSkills = false;
			error = err instanceof Error ? err.message : 'Failed to load skills';
		}
	}

	function handleRetry() {
		if (framework) {
			loadSkills();
		}
	}

	function isSelected(skill: Skill): boolean {
		return selectedSkills.includes(skill.url);
	}

	function handleToggle(url: string) {
		const skill = skills.find((s) => s.url === url);
		if (skill) {
			onToggleSkill(skill);
		}
	}

	// Filter skills based on search query
	const filteredSkills = $derived.by(() => {
		if (!searchQuery.trim()) {
			return skills;
		}

		const query = searchQuery.toLowerCase().trim();
		return skills.filter(
			(skill) =>
				skill.label?.toLowerCase().includes(query) || skill.text.toLowerCase().includes(query)
		);
	});

	const selectionCount = $derived(selectedSkills.length);
	const totalCount = $derived(skills.length);
</script>

<div class="space-y-4">
	<!-- Search Input -->
	{#if framework && !loadingFramework && !loadingSkills && skills.length > 0}
		<div>
			<label for="skill-search" class="sr-only">Search skills</label>
			<Input
				id="skill-search"
				type="text"
				bind:value={searchQuery}
				placeholder="Search skills..."
			/>
		</div>
	{/if}

	<!-- Selection Count -->
	{#if framework && !loadingFramework && !loadingSkills && skills.length > 0}
		<div class="text-sm text-muted-foreground">
			{selectionCount} of {totalCount} selected
		</div>
	{/if}

	<!-- Loading Framework State -->
	{#if loadingFramework}
		<div class="space-y-3">
			{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
				<div class="space-y-2 rounded-lg border p-4">
					<Skeleton class="h-5 w-3/4" />
					<Skeleton class="h-4 w-1/2" />
				</div>
			{/each}
		</div>
		<!-- Loading Skills State -->
	{:else if loadingSkills}
		<div class="space-y-3">
			{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
				<div class="flex items-start gap-3 rounded-lg border p-3 @md:p-4">
					<Skeleton class="mt-1 h-4 w-4 rounded" />
					<div class="flex-1 space-y-2">
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-3 w-1/2" />
					</div>
				</div>
			{/each}
		</div>
		<!-- Error State -->
	{:else if error}
		<Alert variant="destructive">
			<AlertTitle>Error loading skills</AlertTitle>
			<AlertDescription>{error}</AlertDescription>
			{#if framework}
				<Button type="button" variant="outline" size="sm" class="mt-3" onclick={handleRetry}>
					Retry
				</Button>
			{/if}
		</Alert>
		<!-- Skills List -->
	{:else if framework && filteredSkills.length > 0}
		<div class="space-y-2">
			{#each filteredSkills as skill (skill.url)}
				<SkillItem {skill} selected={isSelected(skill)} onToggle={handleToggle} />
			{/each}
		</div>
		<!-- Empty Search Results -->
	{:else if framework && searchQuery.trim() && skills.length > 0}
		<div class="rounded-lg border border-border bg-muted p-8 text-center">
			<p class="text-sm text-muted-foreground">No skills found matching "{searchQuery}"</p>
		</div>
		<!-- No Framework Selected -->
	{:else if !framework}
		<div class="rounded-lg border border-border bg-muted p-8 text-center">
			<p class="text-sm text-muted-foreground">Select a framework to view skills</p>
		</div>
		<!-- No Skills -->
	{:else}
		<div class="rounded-lg border border-border bg-muted p-8 text-center">
			<p class="text-sm text-muted-foreground">No skills available in this framework</p>
		</div>
	{/if}
</div>
