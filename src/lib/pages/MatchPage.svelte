<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import CopyButton from '$lib/components/copy-button/CopyButton.svelte';
	import ExchangePanel from '$lib/components/exchange-panel/ExchangePanel.svelte';
	import {
		extractBadgeDetail,
		type BadgeDetail
	} from '$lib/components/match-board/badge-detail.js';
	import CapabilityCard from '$lib/components/match-board/CapabilityCard.svelte';
	import MatchBoard from '$lib/components/match-board/MatchBoard.svelte';
	import MatchSummary from '$lib/components/match-board/MatchSummary.svelte';
	import type { ClientCredential } from '$lib/components/match-board/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';
	import type { MatchResource } from '$lib/server/domain/match/match-resource.js';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	interface Props {
		job: JobResource;
		// The read-only payload omits the secret capability token; it is never needed client-side.
		match: Omit<MatchResource, 'capabilityToken'>;
		canEdit: boolean;
		/** Present only when `canEdit` (echoed back from the `?edit=` URL); never in the read-only path. */
		editToken: string | null;
	}

	let { job, match, canEdit, editToken }: Props = $props();

	const statusUrl = $derived(`/jobs/${page.params.id}/match/${page.params.matchId}/status`);

	// Build the share/edit URLs from the request origin + path (no query), so the token stays
	// out of the read-only share URL.
	const shareUrl = $derived(`${page.url.origin}${page.url.pathname}`);
	const editUrl = $derived(`${shareUrl}?edit=${editToken ?? ''}`);

	const credentials = $derived<ClientCredential[]>(
		match.verifiedCredentials.map((c) => ({
			credentialId: c.credentialId,
			name: c.name,
			issuer: c.issuer
		}))
	);

	const hasCredentials = $derived(credentials.length > 0);

	// Richer per-credential badge details (issuer + achievement) for the read-only share view,
	// parsed from each stored OpenBadgeCredential `raw`.
	const credentialDetails = $derived<Record<string, BadgeDetail>>(
		Object.fromEntries(
			match.verifiedCredentials.map((c) => [c.credentialId, extractBadgeDetail(c.raw)])
		)
	);

	// Reveal the capability + share links once the applicant has saved their match.
	let saved = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm('Delete this match? This permanently removes it and cannot be undone.')) {
			event.preventDefault();
		}
	}
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<a
			href={resolve('/jobs/[id]', { id: job.id })}
			class="text-body-md font-medium text-primary transition-colors hover:text-primary-container hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			← Back to {job.name}
		</a>

		{#if canEdit}
			<form method="POST" action="?/deleteMatch" onsubmit={confirmDelete}>
				<input type="hidden" name="editToken" value={editToken ?? ''} />
				<Button type="submit" variant="destructive" data-testid="delete-match">
					<Trash2 class="size-4" aria-hidden="true" />
					Delete match
				</Button>
			</form>
		{/if}
	</div>

	<div>
		<h1 class="text-headline-md text-foreground">Skills match</h1>
		<p class="mt-1 text-body-md text-muted-foreground">{job.name} · {job.company}</p>
	</div>

	{#if canEdit}
		{#if hasCredentials}
			<MatchBoard
				skills={job.skills}
				{credentials}
				initialAssignments={match.assignments}
				editToken={editToken ?? ''}
				onSaved={() => (saved = true)}
			/>
		{:else}
			<ExchangePanel
				{statusUrl}
				editToken={editToken ?? ''}
				initialState={match.exchangeState === 'invalid' ? 'invalid' : 'idle'}
			/>
		{/if}

		{#if saved}
			<CapabilityCard {editUrl} {shareUrl} />
		{/if}
	{:else}
		<MatchSummary
			skills={job.skills}
			{credentials}
			assignments={match.assignments}
			details={credentialDetails}
		/>

		<div class="flex flex-wrap items-center gap-3">
			<CopyButton value={shareUrl} label="Copy share link" data-testid="copy-share-link" />
			<span class="text-body-sm text-muted-foreground">
				Share this read-only match in a job application.
			</span>
		</div>
	{/if}
</div>
