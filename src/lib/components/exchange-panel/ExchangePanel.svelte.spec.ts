import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { requestOpenBadgeCredentials } from '$lib/clients/learncard/partner-connect-client.js';

import ExchangePanel, { type StartExchangeResult } from './ExchangePanel.svelte';

vi.mock('$lib/clients/learncard/partner-connect-client.js', () => ({
	requestOpenBadgeCredentials: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

const EXCHANGE: StartExchangeResult = {
	iu: 'https://wallet.example.com/i/abc',
	lcw: 'lcw://verify?ex=abc',
	vcapi: 'https://dcc.test/workflows/verify/exchanges/abc',
	qrDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
	exchangeId: 'abc',
	challenge: 'chal-abc',
	domain: 'https://dcc.test/workflows/verify/exchanges/abc'
};

const VP = {
	'@context': ['https://www.w3.org/ns/credentials/v2'],
	type: ['VerifiablePresentation']
};

function embedPanel() {
	return render(ExchangePanel, {
		poll: false,
		embedMode: 'learncard-partner-connect',
		learnCardHostOrigin: 'https://learncard.app',
		presentUrl: '/jobs/j1/match/m1/present',
		statusUrl: '/jobs/j1/match/m1/status',
		editToken: 'tok-123',
		initialState: 'waiting',
		initialExchange: EXCHANGE
	});
}

describe('ExchangePanel — LearnCard embed variant', () => {
	beforeEach(() => {
		vi.mocked(requestOpenBadgeCredentials).mockReset();
		sessionStorage.clear();
	});

	it('renders the request + "open another wallet" controls and no QR', async () => {
		embedPanel();

		await expect.element(page.getByTestId('learncard-request-cta')).toBeInTheDocument();
		const another = page.getByTestId('exchange-same-device-link');
		await expect.element(another).toHaveTextContent(/open another wallet/i);
		expect(document.querySelector('[data-testid="exchange-qr"]')).toBeNull();
	});

	it('requests a VP with the exchange challenge/domain, relays it, and completes', async () => {
		vi.mocked(requestOpenBadgeCredentials).mockResolvedValue(VP);
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ state: 'complete', verifiedCredentials: [] }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		embedPanel();
		await page.getByTestId('learncard-request-cta').click();

		await vi.waitFor(() => expect(requestOpenBadgeCredentials).toHaveBeenCalledTimes(1));
		expect(requestOpenBadgeCredentials).toHaveBeenCalledWith({
			hostOrigin: 'https://learncard.app',
			challenge: 'chal-abc',
			domain: 'https://dcc.test/workflows/verify/exchanges/abc'
		});

		await vi.waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith(
				'/jobs/j1/match/m1/present',
				expect.objectContaining({ method: 'POST' })
			)
		);
		const body = JSON.parse((fetchMock.mock.calls.at(-1)![1] as RequestInit).body as string);
		expect(body).toEqual({ editToken: 'tok-123', verifiablePresentation: VP });

		await expect
			.element(page.getByTestId('exchange-status'))
			.toHaveTextContent(/credentials verified/i);

		vi.unstubAllGlobals();
	});

	it('requests with a remembered https host override (wins over the default prop)', async () => {
		sessionStorage.setItem('sv:embed-host-origin', 'https://scoutpass.example.com');
		vi.mocked(requestOpenBadgeCredentials).mockResolvedValue(VP);
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ state: 'complete', verifiedCredentials: [] }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		// Prop default is https://learncard.app, but the remembered override must take precedence.
		embedPanel();
		await page.getByTestId('learncard-request-cta').click();

		await vi.waitFor(() => expect(requestOpenBadgeCredentials).toHaveBeenCalledTimes(1));
		expect(requestOpenBadgeCredentials).toHaveBeenCalledWith({
			hostOrigin: 'https://scoutpass.example.com',
			challenge: 'chal-abc',
			domain: 'https://dcc.test/workflows/verify/exchanges/abc'
		});

		vi.unstubAllGlobals();
	});

	it('remembers the embed intent for the session and persists it on mount', async () => {
		embedPanel();
		await expect.element(page.getByTestId('learncard-request-cta')).toBeInTheDocument();
		expect(sessionStorage.getItem('sv:embed-mode')).toBe('learncard-partner-connect');
	});

	it('restores the LearnCard variant from session memory when the ?embed param is absent', async () => {
		sessionStorage.setItem('sv:embed-mode', 'learncard-partner-connect');
		// No embedMode prop (as if navigated without the query param) — still embed via session memory.
		render(ExchangePanel, {
			poll: false,
			presentUrl: '/jobs/j1/match/m1/present',
			statusUrl: '/jobs/j1/match/m1/status',
			initialState: 'waiting',
			initialExchange: EXCHANGE
		});

		await expect.element(page.getByTestId('learncard-request-cta')).toBeInTheDocument();
		expect(document.querySelector('[data-testid="exchange-qr"]')).toBeNull();
	});

	it('shows a retryable message and does not relay when nothing is shared', async () => {
		vi.mocked(requestOpenBadgeCredentials).mockResolvedValue(null);
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		embedPanel();
		await page.getByTestId('learncard-request-cta').click();

		await expect.element(page.getByTestId('learncard-error')).toHaveTextContent(/no credentials/i);
		expect(fetchMock).not.toHaveBeenCalled();
		await expect.element(page.getByTestId('learncard-request-cta')).toBeInTheDocument();

		vi.unstubAllGlobals();
	});
});

describe('ExchangePanel — default (non-embed) variant', () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it('still renders the QR + "open on this device"', async () => {
		render(ExchangePanel, {
			poll: false,
			statusUrl: '/jobs/j1/match/m1/status',
			initialState: 'waiting',
			initialExchange: EXCHANGE
		});

		await expect.element(page.getByTestId('exchange-qr')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('exchange-same-device-link'))
			.toHaveTextContent(/open on this device/i);
		expect(document.querySelector('[data-testid="learncard-request-cta"]')).toBeNull();
	});
});
