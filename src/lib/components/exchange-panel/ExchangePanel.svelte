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

	/** Result shape returned by the P3 `startExchange` form action. */
	export interface StartExchangeResult {
		iu: string;
		lcw: string;
		vcapi: string;
		qrDataUrl: string;
		exchangeId: string;
	}
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Loader from '@lucide/svelte/icons/loader-circle';

	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		/** Absolute path to the status poll endpoint, e.g. `/jobs/abc/match/xyz/status`. */
		statusUrl?: string;
		/** Disable polling (Storybook / tests). */
		poll?: boolean;
		/** Seed the panel into a given state for stories. */
		initialState?: ExchangeUiState;
		/** Seed the QR / link for stories without running the action. */
		initialExchange?: StartExchangeResult | null;
		/** Capability token re-posted with `startExchange` so the server can authorize it. */
		editToken?: string;
		class?: string;
	}

	let {
		statusUrl,
		poll = true,
		initialState = 'idle',
		initialExchange = null,
		editToken = '',
		class: className
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let uiState = $state<ExchangeUiState>(initialState);
	// svelte-ignore state_referenced_locally
	let exchange = $state<StartExchangeResult | null>(initialExchange);
	let actionError = $state<string | null>(null);

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

	function reset() {
		uiState = 'idle';
		exchange = null;
		actionError = null;
	}
</script>

<div
	class={cn('rounded-xl bg-card p-6 shadow-ambient sm:p-8', className)}
	data-testid="exchange-panel"
>
	<div class="space-y-2">
		<h2 class="text-title-lg font-semibold text-foreground">Verify your credentials</h2>
		<p class="text-body-md text-muted-foreground">
			Scan the code with your wallet, or open the link on this device, to share verifiable
			credentials for this role.
		</p>
	</div>

	{#if uiState === 'idle' || uiState === 'starting'}
		<form
			method="POST"
			action="?/startExchange"
			class="mt-6"
			use:enhance={() => {
				uiState = 'starting';
				actionError = null;
				return async ({ result }) => {
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
				};
			}}
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
