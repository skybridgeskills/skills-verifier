<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Jobs</h1>
			<p class="mt-1 text-sm text-muted-foreground">Active postings in the in-memory store.</p>
		</div>
		<Button href={resolve('/jobs/create')}>Create job</Button>
	</div>

	{#if data.jobs.length === 0}
		<p class="text-sm text-muted-foreground">No active jobs yet.</p>
	{:else}
		<ul class="divide-y divide-border rounded-lg border border-border bg-card">
			{#each data.jobs as job (job.id)}
				<li class="px-4 py-4">
					<a
						href={resolve(`/jobs/${job.id}`)}
						class="font-medium text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						{job.name}
					</a>
					<div class="text-sm text-muted-foreground">{job.company}</div>
					<p class="mt-2 text-sm text-foreground/90">{job.description}</p>
					<div class="mt-2 text-xs text-muted-foreground">
						{job.skills.length} skill{job.skills.length === 1 ? '' : 's'}
						{#if job.frameworks.length > 0}
							· {job.frameworks.length} framework hint{job.frameworks.length === 1 ? '' : 's'}
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
