<script lang="ts">
	import ExchangePanel from '$lib/components/exchange-panel/ExchangePanel.svelte';
	import MatchBoard from '$lib/components/match-board/MatchBoard.svelte';
	import type { ClientCredential } from '$lib/components/match-board/types.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';
	import type { MatchResource } from '$lib/server/domain/match/match-resource.js';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	interface Props {
		job: JobResource;
		match: MatchResource;
	}

	let { job, match }: Props = $props();

	const statusUrl = $derived(`/jobs/${page.params.id}/match/${page.params.matchId}/status`);

	const credentials = $derived<ClientCredential[]>(
		match.verifiedCredentials.map((c) => ({
			credentialId: c.credentialId,
			name: c.name,
			issuer: c.issuer
		}))
	);

	const hasCredentials = $derived(credentials.length > 0);
</script>

<div class="space-y-8">
	<div>
		<a
			href={resolve('/jobs/[id]', { id: job.id })}
			class="text-body-md font-medium text-primary transition-colors hover:text-primary-container hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			← Back to {job.name}
		</a>
	</div>

	<div>
		<h1 class="text-headline-md text-foreground">Skills match</h1>
		<p class="mt-1 text-body-md text-muted-foreground">{job.name} · {job.company}</p>
	</div>

	{#if hasCredentials}
		<MatchBoard skills={job.skills} {credentials} initialAssignments={match.assignments} />
	{:else}
		<ExchangePanel
			{statusUrl}
			initialState={match.exchangeState === 'invalid' ? 'invalid' : 'idle'}
		/>
	{/if}
</div>
