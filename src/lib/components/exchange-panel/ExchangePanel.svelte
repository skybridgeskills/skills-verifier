<script lang="ts" module>
	/** Lifecycle of the verification exchange as surfaced to the user. */
	export type ExchangeUiState =
		| 'idle'
		| 'starting'
		| 'waiting'
		| 'active'
		| 'complete'
		| 'invalid'
		| 'error';

	/** Result shape returned by the `startExchange` form action. */
	export interface StartExchangeResult {
		iu: string;
		lcw: string;
		vcapi: string;
		qrDataUrl: string;
		exchangeId: string;
		/** Challenge a client-side wallet must sign the presentation against (embed variant). */
		challenge: string;
		/** Domain a client-side wallet must sign the presentation against (embed variant). */
		domain: string;
	}
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import type { ActionResult } from '@sveltejs/kit';

	import { requestOpenBadgeCredentials } from '$lib/clients/learncard/partner-connect-client.js';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	import { EMBED_LEARNCARD_PARTNER_CONNECT, type EmbedMode } from './embed-mode.js';
	import { readEmbedMode, rememberEmbedMode } from './embed-preference.js';

	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		/** Absolute path to the status poll endpoint, e.g. `/jobs/abc/match/xyz/status`. */
		statusUrl?: string;
		/** Absolute path to the present (VP relay) endpoint; required for the LearnCard embed variant. */
		presentUrl?: string;
		/** Disable polling (Storybook / tests). */
		poll?: boolean;
		/** Seed the panel into a given state for stories. */
		initialState?: ExchangeUiState;
		/** Seed the QR / link for stories without running the action. */
		initialExchange?: StartExchangeResult | null;
		/** Capability token re-posted with `startExchange` so the server can authorize it. */
		editToken?: string;
		/** Presentation embed variant; `learncard-partner-connect` swaps the QR for a request button. */
		embedMode?: EmbedMode;
		/** LearnCard host origin for the partner-connect embed variant. */
		learnCardHostOrigin?: string;
		class?: string;
	}

	let {
		statusUrl,
		presentUrl,
		poll = true,
		initialState = 'idle',
		initialExchange = null,
		editToken = '',
		embedMode = null,
		learnCardHostOrigin = 'https://learncard.app',
		class: className
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let uiState = $state<ExchangeUiState>(initialState);
	// svelte-ignore state_referenced_locally
	let exchange = $state<StartExchangeResult | null>(initialExchange);
	let actionError = $state<string | null>(null);

	// LearnCard embed variant: request against the host wallet instead of scanning a QR. The intent
	// is remembered for the session (see embed-preference), so it survives in-session navigation even
	// if the user later returns to a match URL without the `?embed=` param.
	let rememberedEmbed = $state<EmbedMode>(null);
	const effectiveEmbed = $derived(embedMode ?? rememberedEmbed);
	const isLearnCardEmbed = $derived(effectiveEmbed === EMBED_LEARNCARD_PARTNER_CONNECT);
	let learnCardBusy = $state(false);
	let learnCardError = $state<string | null>(null);
	let startForm = $state<HTMLFormElement | null>(null);
	// Resolver used to await a programmatic `startExchange` submit before requesting from LearnCard.
	let pendingStart: ((value: StartExchangeResult | null) => void) | null = null;

	const isPolling = $derived(uiState === 'waiting' || uiState === 'active');

	async function pollOnce() {
		if (!statusUrl) return;
		try {
			const res = await fetch(statusUrl, { headers: { accept: 'application/json' } });
			if (!res.ok) return;
			const data: { state?: string } = await res.json();
			switch (data.state) {
				case 'active':
					uiState = 'active';
					break;
				case 'complete':
					uiState = 'complete';
					// Reload the page data so `match.verifiedCredentials` is populated from storage.
					await invalidateAll();
					break;
				case 'invalid':
					uiState = 'invalid';
					break;
				// 'none' / 'pending' → keep waiting
			}
		} catch {
			// Transient network errors are swallowed; the next tick retries.
		}
	}

	$effect(() => {
		if (!poll || !isPolling || !statusUrl) return;
		const id = setInterval(pollOnce, 2500);
		// Kick an immediate poll so the UI reflects fast completions without a 2.5s delay.
		void pollOnce();
		return () => clearInterval(id);
	});

	// Persist / restore the embed intent for the session (client-only; sessionStorage).
	$effect(() => {
		if (embedMode) {
			rememberEmbedMode(embedMode);
		} else {
			rememberedEmbed = readEmbedMode();
		}
	});

	/** Progressive-enhancement handler for the `startExchange` action, shared by both variants. */
	const startExchangeEnhance = () => {
		uiState = 'starting';
		actionError = null;
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success' && result.data) {
				exchange = result.data as unknown as StartExchangeResult;
				uiState = 'waiting';
			} else if (result.type === 'failure') {
				actionError =
					(result.data?.error as string | undefined) ??
					'Could not start verification. Please try again.';
				uiState = 'error';
			} else {
				actionError = 'Could not start verification. Please try again.';
				uiState = 'error';
			}
			// Release any click-to-start caller waiting on the exchange (embed variant).
			pendingStart?.(exchange);
			pendingStart = null;
		};
	};

	/** Start the exchange on demand (click-to-start) and resolve once `exchange` is available. */
	function ensureExchange(): Promise<StartExchangeResult | null> {
		if (exchange) return Promise.resolve(exchange);
		if (!startForm) return Promise.resolve(null);
		return new Promise((resolve) => {
			pendingStart = resolve;
			startForm?.requestSubmit();
		});
	}

	async function requestFromLearnCard() {
		if (!presentUrl) return;

		learnCardBusy = true;
		learnCardError = null;
		try {
			const active = await ensureExchange();
			if (!active) {
				learnCardError = 'Could not start verification. You can try again.';
				return;
			}
			if (!active.challenge || !active.domain) {
				learnCardError =
					'This verification could not be prepared for LearnCard. Try “Open another wallet”.';
				return;
			}

			const verifiablePresentation = await requestOpenBadgeCredentials({
				hostOrigin: learnCardHostOrigin,
				challenge: active.challenge,
				domain: active.domain
			});

			if (!verifiablePresentation) {
				learnCardError = 'No credentials were shared. You can try again.';
				return;
			}

			const res = await fetch(presentUrl, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ editToken, verifiablePresentation })
			});
			const data: { state?: string } = res.ok ? await res.json() : {};

			if (data.state === 'complete') {
				uiState = 'complete';
				await invalidateAll();
			} else if (data.state === 'invalid') {
				learnCardError = 'Those credentials could not be verified. You can try again.';
			} else {
				learnCardError = 'Verification did not complete. You can try again.';
			}
		} catch (err) {
			const code = (err as { code?: string })?.code;
			learnCardError =
				code === 'USER_REJECTED'
					? 'Request cancelled. You can request again when ready.'
					: 'Could not reach LearnCard. You can try again.';
		} finally {
			learnCardBusy = false;
		}
	}

	function reset() {
		uiState = 'idle';
		exchange = null;
		actionError = null;
		learnCardError = null;
	}
</script>

<div
	class={cn('rounded-xl bg-card p-6 shadow-ambient sm:p-8', className)}
	data-testid="exchange-panel"
>
	<div class="space-y-2">
		<h2 class="text-title-lg font-semibold text-foreground">Verify your credentials</h2>
		<p class="text-body-md text-muted-foreground">
			{#if isLearnCardEmbed}
				Request your verifiable credentials from LearnCard, or open another wallet, to share them
				for this role.
			{:else}
				Scan the code with your wallet, or open the link on this device, to share verifiable
				credentials for this role.
			{/if}
		</p>
	</div>

	{#if isLearnCardEmbed}
		{#if uiState !== 'complete' && uiState !== 'invalid' && uiState !== 'error'}
			<!-- Hidden form kept mounted so the request button can start the exchange on demand. -->
			{#if uiState === 'idle' || uiState === 'starting'}
				<form
					bind:this={startForm}
					method="POST"
					action="?/startExchange"
					use:enhance={startExchangeEnhance}
				>
					<input type="hidden" name="editToken" value={editToken} />
				</form>
			{/if}

			<div class="mt-6 flex flex-col items-center gap-5">
				<Button
					type="button"
					variant="flame"
					onclick={requestFromLearnCard}
					disabled={learnCardBusy}
					data-testid="learncard-request-cta"
				>
					{#if learnCardBusy}
						<Loader class="size-4 animate-spin" aria-hidden="true" />
						Requesting…
					{:else}
						Request from LearnCard
					{/if}
				</Button>

				{#if exchange}
					<Button
						href={exchange.iu}
						target="_blank"
						rel="noopener noreferrer"
						variant="outline"
						data-testid="exchange-same-device-link"
					>
						Open another wallet
					</Button>
				{/if}

				{#if learnCardError}
					<Alert variant="destructive" data-testid="learncard-error">
						<CircleX class="size-4" />
						<AlertDescription>{learnCardError}</AlertDescription>
					</Alert>
				{/if}
			</div>
		{/if}
	{:else}
		{#if uiState === 'idle' || uiState === 'starting'}
			<form
				bind:this={startForm}
				method="POST"
				action="?/startExchange"
				class="mt-6"
				use:enhance={startExchangeEnhance}
			>
				<input type="hidden" name="editToken" value={editToken} />
				<Button
					type="submit"
					variant="flame"
					data-testid="verify-cta"
					disabled={uiState === 'starting'}
				>
					{#if uiState === 'starting'}
						<Loader class="size-4 animate-spin" aria-hidden="true" />
						Starting…
					{:else}
						Verify your credentials
					{/if}
				</Button>
			</form>
		{/if}

		{#if exchange && (uiState === 'waiting' || uiState === 'active')}
			<div class="mt-6 flex flex-col items-center gap-5">
				<div class="rounded-xl border border-border/15 bg-background p-4 shadow-ambient">
					<img
						src={exchange.qrDataUrl}
						alt="Scan to verify with your wallet"
						class="size-48"
						data-testid="exchange-qr"
					/>
				</div>

				<Button
					href={exchange.iu}
					target="_blank"
					rel="noopener noreferrer"
					variant="outline"
					data-testid="exchange-same-device-link"
				>
					Open on this device
				</Button>

				<div
					class="flex items-center gap-2 text-body-md text-muted-foreground"
					role="status"
					aria-live="polite"
					data-testid="exchange-status"
				>
					<Loader class="size-4 animate-spin text-warmth" aria-hidden="true" />
					{#if uiState === 'active'}
						Verifying…
					{:else}
						Waiting for wallet…
					{/if}
				</div>
			</div>
		{/if}
	{/if}

	{#if uiState === 'complete'}
		<Alert
			class="mt-6 border-flame/40 bg-flame-subtle text-foreground"
			data-testid="exchange-status"
		>
			<CircleCheck class="size-4 text-flame" />
			<AlertTitle>Credentials verified</AlertTitle>
			<AlertDescription class="text-muted-foreground">
				Your verified credentials are ready to assign to skills below.
			</AlertDescription>
		</Alert>
	{/if}

	{#if uiState === 'invalid' || uiState === 'error'}
		<div class="mt-6 space-y-4" data-testid="exchange-status">
			<Alert variant="destructive">
				<CircleX class="size-4" />
				<AlertTitle>
					{uiState === 'invalid' ? 'Verification did not complete' : 'Could not start verification'}
				</AlertTitle>
				<AlertDescription>
					{actionError ?? 'Something went wrong with the exchange. You can try again.'}
				</AlertDescription>
			</Alert>
			<Button type="button" variant="outline" onclick={reset} data-testid="exchange-retry">
				Try again
			</Button>
		</div>
	{/if}
</div>
