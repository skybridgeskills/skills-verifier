<script lang="ts">
	import { JobShareDialog } from '$lib/components/job-share-dialog/index.js';
	import { SkillItem } from '$lib/components/skill-item/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';

	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	interface Props {
		job: JobResource;
	}

	let { job }: Props = $props();

	const statusVariant = $derived(
		job.status === 'active' ? 'default' : job.status === 'closed' ? 'secondary' : 'outline'
	);

	let shareOpen = $state(false);

	// Auto-open the share dialog once, right after a job is created
	// (`/jobs/create` redirects here with `?created=1`). Clear the flag via
	// replaceState so a refresh or back-navigation doesn't reopen it.
	$effect(() => {
		if (page.url.searchParams.get('created') === '1') {
			shareOpen = true;
			replaceState(resolve('/jobs/[id]', { id: job.id }), page.state);
		}
	});
</script>

<div class="space-y-8">
	<div>
		<a
			href={resolve('/jobs')}
			class="text-body-md font-medium text-primary transition-colors hover:text-primary-container hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			← Back to jobs
		</a>
	</div>

	<div class="flex flex-col gap-3 @sm:flex-row @sm:items-start @sm:justify-between">
		<div class="min-w-0 flex-1">
			<h1 class="text-headline-md text-foreground">{job.name}</h1>
			<p class="mt-1 text-body-md text-muted-foreground">{job.company}</p>
		</div>
		<Badge variant={statusVariant} class="w-fit shrink-0 capitalize">
			{job.status}
		</Badge>
	</div>

	<div class="flex flex-wrap gap-3">
		<form method="POST" action="?/createMatch">
			<Button type="submit" variant="default">Create a skills match</Button>
		</form>
		<Button type="button" variant="secondary" onclick={() => (shareOpen = true)}>
			Hire for this Job
		</Button>
	</div>

	<JobShareDialog {job} bind:open={shareOpen} />

	<p class="text-body-md text-muted-foreground">{job.description}</p>

	<dl class="grid gap-3 text-body-md">
		<div>
			<dt class="text-muted-foreground">External ID</dt>
			<dd class="mt-0.5 font-mono text-xs text-foreground">{job.externalId}</dd>
		</div>
		{#if job.externalUrl}
			<div>
				<dt class="text-muted-foreground">Apply</dt>
				<dd class="mt-1">
					<Button
						href={job.externalUrl}
						variant="secondary"
						size="sm"
						target="_blank"
						rel="noopener noreferrer"
					>
						View job posting
					</Button>
				</dd>
			</div>
		{/if}
	</dl>

	<div>
		<h2 class="text-title-lg font-semibold text-foreground">
			Skills ({job.skills.length})
		</h2>
		{#if job.skills.length === 0}
			<p class="mt-2 text-body-md text-muted-foreground">No skills listed.</p>
		{:else}
			<ul class="mt-3 space-y-3">
				{#each job.skills as skill (skill.url)}
					<li class="rounded-xl bg-card px-4 py-3 shadow-ambient">
						<SkillItem {skill} />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
