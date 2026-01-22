<script lang="ts">
	import type { Framework } from '$lib/types/job-profile';

	interface Props {
		frameworks: Framework[];
		onSelect: (framework: Framework) => void;
		loading?: boolean;
		error?: string | null;
	}

	let { frameworks, onSelect, loading = false, error = null }: Props = $props();

	let searchQuery = $state('');

	// Filter frameworks based on search query
	const filteredFrameworks = $derived(() => {
		if (!frameworks || frameworks.length === 0) {
			return [];
		}

		if (!searchQuery.trim()) {
			return frameworks;
		}

		const query = searchQuery.toLowerCase().trim();
		return frameworks.filter(
			(framework) =>
				framework.name.toLowerCase().includes(query) ||
				framework.organization.toLowerCase().includes(query)
		);
	});

	function handleSelect(framework: Framework) {
		onSelect(framework);
	}
</script>

<div class="space-y-4">
	<!-- Search Input -->
	<div>
		<label for="framework-search" class="sr-only">Search frameworks</label>
		<input
			id="framework-search"
			type="text"
			bind:value={searchQuery}
			placeholder="Search by framework name or organization..."
			class="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 focus:border-blue-500 focus:ring-blue-500 @md:text-sm"
			disabled={loading}
		/>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="space-y-3">
			{#each Array.from({ length: 2 }, (_, i) => i) as i (i)}
				<div class="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-4">
					<div class="h-5 w-3/4 rounded bg-gray-300"></div>
					<div class="mt-2 h-4 w-1/2 rounded bg-gray-300"></div>
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
				<p class="text-sm font-medium text-red-800">Error loading framework</p>
			</div>
			<p class="mt-1 text-sm text-red-600">{error}</p>
		</div>
		<!-- Framework List -->
	{:else if filteredFrameworks().length > 0}
		<div class="space-y-2">
			{#each filteredFrameworks() as framework (framework.ctid)}
				<button
					type="button"
					onclick={() => handleSelect(framework)}
					class="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none @md:p-5"
				>
					<div class="font-medium text-gray-900">{framework.name}</div>
					<div class="mt-1 text-sm text-gray-600">{framework.organization}</div>
				</button>
			{/each}
		</div>
		<!-- Empty Search Results -->
	{:else if searchQuery.trim()}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">No frameworks found matching "{searchQuery}"</p>
		</div>
		<!-- No Frameworks -->
	{:else}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">No frameworks available</p>
		</div>
	{/if}
</div>
