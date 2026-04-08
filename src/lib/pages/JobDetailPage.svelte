<script lang="ts">
	import { SkillItem } from '$lib/components/skill-item/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';

	import { resolve } from '$app/paths';

	interface Props {
		job: JobResource;
	}

	let { job }: Props = $props();

	const statusVariant = $derived(
		job.status === 'active' ? 'default' : job.status === 'closed' ? 'secondary' : 'outline'
	);
</script>

<div class="space-y-6">
	<div>
		<a
			href={resolve('/jobs')}
			class="text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			← Back to jobs
		</a>
	</div>

	<div class="flex flex-col gap-3 @sm:flex-row @sm:items-start @sm:justify-between">
		<div class="min-w-0 flex-1">
			<h1 class="text-2xl font-bold text-foreground">{job.name}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{job.company}</p>
		</div>
		<Badge variant={statusVariant} class="w-fit shrink-0 capitalize">
			{job.status}
		</Badge>
	</div>

	<p class="text-sm leading-relaxed text-foreground/90">{job.description}</p>

	<dl class="grid gap-3 text-sm">
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
						Open posting
					</Button>
				</dd>
			</div>
		{/if}
	</dl>

	<div>
		<h2 class="text-lg font-semibold text-foreground">
			Skills ({job.skills.length})
		</h2>
		{#if job.skills.length === 0}
			<p class="mt-2 text-sm text-muted-foreground">No skills listed.</p>
		{:else}
			<ul class="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
				{#each job.skills as skill (skill.url)}
					<li class="px-4 py-3">
						<SkillItem {skill} />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
