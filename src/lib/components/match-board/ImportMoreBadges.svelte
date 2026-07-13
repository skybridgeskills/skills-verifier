<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import type { EmbedMode } from '$lib/components/exchange-panel/embed-mode.js';
	import ExchangePanel from '$lib/components/exchange-panel/ExchangePanel.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		/** Absolute path to the status poll endpoint (threaded from the page). */
		statusUrl?: string;
		/** Absolute path to the present (VP relay) endpoint; required for the LearnCard embed variant. */
		presentUrl?: string;
		/** Capability token re-posted with `startExchange` so the server can authorize it. */
		editToken: string;
		/** Presentation embed variant (e.g. LearnCard partner-connect). */
		embedMode?: EmbedMode;
		/** LearnCard host origin for the partner-connect embed variant. */
		learnCardHostOrigin?: string;
	}

	let { statusUrl, presentUrl, editToken, embedMode = null, learnCardHostOrigin }: Props = $props();

	// Collapsible inline exchange. The board hosting this stays mounted, so opening the panel and
	// running another exchange never resets the applicant's draft assignments/narratives.
	let showExchange = $state(false);
</script>

<div class="space-y-4">
	<Button
		type="button"
		variant="outline"
		onclick={() => (showExchange = !showExchange)}
		aria-expanded={showExchange}
		data-testid="import-more-badges"
	>
		<Plus class="size-4" aria-hidden="true" />
		Import more badges
	</Button>

	{#if showExchange}
		<ExchangePanel
			{statusUrl}
			{presentUrl}
			{editToken}
			{embedMode}
			{learnCardHostOrigin}
			initialState="idle"
			onCompleted={() => (showExchange = false)}
		/>
	{/if}
</div>
