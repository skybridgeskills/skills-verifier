<script lang="ts">
	import SkillItem from './SkillItem.svelte';
	import type { Framework, Skill } from '$lib/types/job-profile';
	import type { FrameworkService } from '$lib/services/framework-service';

	interface Props {
		framework: Framework | null;
		selectedSkills: string[];
		onToggleSkill: (skill: Skill) => void;
		service: FrameworkService;
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
			<input
				id="skill-search"
				type="text"
				bind:value={searchQuery}
				placeholder="Search skills..."
				class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 @md:text-sm"
			/>
		</div>
	{/if}

	<!-- Selection Count -->
	{#if framework && !loadingFramework && !loadingSkills && skills.length > 0}
		<div class="text-sm text-gray-600">
			{selectionCount} of {totalCount} selected
		</div>
	{/if}

	<!-- Loading Framework State -->
	{#if loadingFramework}
		<div class="space-y-3">
			{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
				<div class="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-4">
					<div class="h-5 w-3/4 rounded bg-gray-300"></div>
					<div class="mt-2 h-4 w-1/2 rounded bg-gray-300"></div>
				</div>
			{/each}
		</div>
		<!-- Loading Skills State -->
	{:else if loadingSkills}
		<div class="space-y-3">
			{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
				<div class="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-3 @md:p-4">
					<div class="flex items-start gap-3">
						<div class="mt-1 h-4 w-4 rounded bg-gray-300"></div>
						<div class="flex-1">
							<div class="h-4 w-3/4 rounded bg-gray-300"></div>
							<div class="mt-2 h-3 w-1/2 rounded bg-gray-300"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<!-- Error State -->
	{:else if error}
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
				<p class="text-sm font-medium text-red-800">Error loading skills</p>
			</div>
			<p class="mt-1 text-sm text-red-600">{error}</p>
			{#if framework}
				<button
					type="button"
					onclick={handleRetry}
					class="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
				>
					Retry
				</button>
			{/if}
		</div>
		<!-- Skills List -->
	{:else if framework && filteredSkills.length > 0}
		<div class="space-y-2">
			{#each filteredSkills as skill (skill.url)}
				<SkillItem {skill} selected={isSelected(skill)} onToggle={handleToggle} />
			{/each}
		</div>
		<!-- Empty Search Results -->
	{:else if framework && searchQuery.trim() && skills.length > 0}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">No skills found matching "{searchQuery}"</p>
		</div>
		<!-- No Framework Selected -->
	{:else if !framework}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">Select a framework to view skills</p>
		</div>
		<!-- No Skills -->
	{:else}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">No skills available in this framework</p>
		</div>
	{/if}
</div>
