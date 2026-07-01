import { describe, expect, it } from 'vitest';

import {
	FAKE_COMPLETE_AFTER_POLLS,
	FAKE_VERIFIED_CREDENTIALS,
	FakeVerificationExchange
} from './fake-verification-exchange.js';

describe('FakeVerificationExchange', () => {
	it('createVerifyExchange returns an exchangeId and protocols with an interact URL', async () => {
		const svc = FakeVerificationExchange();
		const { exchangeId, protocols } = await svc.createVerifyExchange();

		expect(exchangeId).toBeTruthy();
		expect(protocols.iu).toContain(exchangeId);
		expect(protocols.iu.startsWith('https://')).toBe(true);
		expect(protocols.vcapi).toContain(exchangeId);
		expect(protocols.verifiablePresentationRequest).toEqual({});
	});

	it('is non-complete on the first poll and complete after the threshold', async () => {
		const svc = FakeVerificationExchange();
		const { exchangeId, protocols } = await svc.createVerifyExchange();

		const first = await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi });
		expect(first.state).not.toBe('complete');
		expect(first.verifiedCredentials).toEqual([]);

		// Poll up to the threshold (default 2). The poll that reaches it returns complete.
		let last = first;
		for (let poll = 1; poll < FAKE_COMPLETE_AFTER_POLLS; poll++) {
			last = await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi });
		}

		expect(last.state).toBe('complete');
		expect(last.verifiedCredentials).toHaveLength(FAKE_VERIFIED_CREDENTIALS.length);
	});

	it('complete payload carries fixture credential shape (credentialId/name/issuer/raw)', async () => {
		const svc = FakeVerificationExchange(1);
		const { exchangeId, protocols } = await svc.createVerifyExchange();

		const status = await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi });
		expect(status.state).toBe('complete');

		const [cred] = status.verifiedCredentials;
		expect(cred.credentialId).toBe('urn:uuid:fake-credential-1');
		expect(cred.name).toBe('Patient Care Fundamentals');
		expect(cred.issuer).toBe('Riverside Community College');
		expect(cred.raw).toBeTypeOf('object');
	});

	it('honors a custom completeAfterPolls threshold', async () => {
		const svc = FakeVerificationExchange(3);
		const { exchangeId, protocols } = await svc.createVerifyExchange();

		expect((await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi })).state).toBe(
			'pending'
		);
		expect((await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi })).state).toBe(
			'active'
		);
		expect((await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi })).state).toBe(
			'complete'
		);
	});
});
