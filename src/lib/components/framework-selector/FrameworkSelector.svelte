<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { Framework } from '$lib/types/job-profile';

	interface Props {
		frameworks: Framework[];
		onSelect: (framework: Framework) => void;
		selectedFramework?: Framework | null;
		loading?: boolean;
		error?: string | null;
	}

	let {
		frameworks,
		onSelect,
		selectedFramework = null,
		loading = false,
		error = null
	}: Props = $props();

	let searchQuery = $state('');
	// Use $derived to sync with prop, but make it writable for manual updates
	let selectedValue = $state('');

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

	// Update selectedValue when selectedFramework prop changes
	$effect(() => {
		const propValue = selectedFramework?.ctid || '';
		if (propValue !== selectedValue) {
			selectedValue = propValue;
		}
	});

	// Handle radio group value change
	function handleValueChange(value: string) {
		selectedValue = value;
		const framework = frameworks.find((f) => f.ctid === value);
		if (framework) {
			onSelect(framework);
		}
	}
</script>

<div class="space-y-4">
	<!-- Search Input -->
	<div>
		<label for="framework-search" class="sr-only">Search frameworks</label>
		<Input
			id="framework-search"
			type="text"
			bind:value={searchQuery}
			placeholder="Search by framework name or organization..."
			disabled={loading}
		/>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="space-y-3">
			{#each Array.from({ length: 2 }, (_, i) => i) as i (i)}
				<div class="space-y-2 rounded-lg border p-4">
					<Skeleton class="h-5 w-3/4" />
					<Skeleton class="h-4 w-1/2" />
				</div>
			{/each}
		</div>
		<!-- Error State -->
	{:else if error}
		<Alert variant="destructive">
			<AlertTitle>Error loading framework</AlertTitle>
			<AlertDescription>{error}</AlertDescription>
		</Alert>
		<!-- Framework List -->
	{:else if filteredFrameworks().length > 0}
		<RadioGroup.Root value={selectedValue} onValueChange={handleValueChange} class="space-y-2">
			{#each filteredFrameworks() as framework (framework.ctid)}
				{@const isSelected = selectedValue === framework.ctid}
				<Label
					for={framework.ctid}
					class="flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors {isSelected
						? 'border-primary bg-accent'
						: 'border-border bg-card'}"
				>
					<RadioGroup.Item value={framework.ctid} id={framework.ctid} class="mt-0.5" />
					<div class="flex-1 space-y-1 font-normal">
						<div class="font-medium text-foreground">{framework.name}</div>
						<div class="text-sm text-muted-foreground">{framework.organization}</div>
					</div>
				</Label>
			{/each}
		</RadioGroup.Root>
		<!-- Empty Search Results -->
	{:else if searchQuery.trim()}
		<div class="rounded-lg border border-border bg-muted p-8 text-center">
			<p class="text-sm text-muted-foreground">No frameworks found matching "{searchQuery}"</p>
		</div>
		<!-- No Frameworks -->
	{:else}
		<div class="rounded-lg border border-border bg-muted p-8 text-center">
			<p class="text-sm text-muted-foreground">No frameworks available</p>
		</div>
	{/if}
</div>
