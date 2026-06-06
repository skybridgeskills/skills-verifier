<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ExchangePanel, { type StartExchangeResult } from './ExchangePanel.svelte';

	// 1x1 transparent PNG; stands in for the QR data URL without running the action/network.
	const qrDataUrl =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

	const exchange: StartExchangeResult = {
		iu: 'https://wallet.example.com/verify?challenge=abc123',
		lcw: 'lcw://verify?challenge=abc123',
		vcapi: 'https://issuer.example.com/exchanges/abc123',
		qrDataUrl,
		exchangeId: 'ex-abc-123'
	};

	const { Story } = defineMeta({
		title: 'components/ExchangePanel',
		component: ExchangePanel,
		tags: ['autodocs']
	});
</script>

<Story name="Idle">
	<div class="max-w-xl">
		<ExchangePanel poll={false} initialState="idle" />
	</div>
</Story>

<Story name="Waiting (QR shown)">
	<div class="max-w-xl">
		<ExchangePanel poll={false} initialState="waiting" initialExchange={exchange} />
	</div>
</Story>

<Story name="Active (verifying)">
	<div class="max-w-xl">
		<ExchangePanel poll={false} initialState="active" initialExchange={exchange} />
	</div>
</Story>

<Story name="Complete">
	<div class="max-w-xl">
		<ExchangePanel poll={false} initialState="complete" />
	</div>
</Story>

<Story name="Invalid">
	<div class="max-w-xl">
		<ExchangePanel poll={false} initialState="invalid" />
	</div>
</Story>
