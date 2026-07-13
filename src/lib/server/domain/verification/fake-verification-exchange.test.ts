import { describe, expect, it } from 'vitest';

import {
	FAKE_COMPLETE_AFTER_POLLS,
	FAKE_INVALID_VERIFIED_CREDENTIALS,
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
		// The VPR carries the challenge + domain a wallet must sign against.
		expect(protocols.verifiablePresentationRequest).toMatchObject({
			challenge: `fake-challenge-${exchangeId}`,
			domain: protocols.vcapi
		});
	});

	it('fetchExchangeVpr returns the challenge/domain for a created exchange', async () => {
		const svc = FakeVerificationExchange();
		const { exchangeId, protocols } = await svc.createVerifyExchange();

		const vpr = await svc.fetchExchangeVpr({ vcapi: protocols.vcapi });
		expect(vpr).toEqual({ challenge: `fake-challenge-${exchangeId}`, domain: protocols.vcapi });
	});

	it('submitPresentation "verifies" any VP and returns complete with fixtures', async () => {
		const svc = FakeVerificationExchange();
		const { protocols } = await svc.createVerifyExchange();

		const status = await svc.submitPresentation({
			vcapi: protocols.vcapi,
			verifiablePresentation: { '@context': [], type: ['VerifiablePresentation'] }
		});
		expect(status.state).toBe('complete');
		expect(status.verifiedCredentials).toHaveLength(FAKE_VERIFIED_CREDENTIALS.length);
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

	it('happy-path fixtures carry verified + empty problems', async () => {
		const svc = FakeVerificationExchange(1);
		const { exchangeId, protocols } = await svc.createVerifyExchange();
		const status = await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi });

		expect(status.presentationProblems).toEqual([]);
		expect(status.verifiedCredentials.every((c) => c.verified && c.problems.length === 0)).toBe(
			true
		);
	});

	it('reports the invalid outcome with problem fixtures + presentation problems', async () => {
		const svc = FakeVerificationExchange(1, { outcome: 'invalid' });
		const { exchangeId, protocols } = await svc.createVerifyExchange();
		const status = await svc.getExchangeStatus({ exchangeId, vcapi: protocols.vcapi });

		expect(status.state).toBe('invalid');
		expect(status.verifiedCredentials).toHaveLength(FAKE_INVALID_VERIFIED_CREDENTIALS.length);
		// A mix: one fatal (verified:false) and one non-fatal warning (verified:true).
		expect(
			status.verifiedCredentials.some((c) => !c.verified && c.problems.some((p) => p.fatal))
		).toBe(true);
		expect(
			status.verifiedCredentials.some((c) => c.verified && c.problems.some((p) => !p.fatal))
		).toBe(true);
		expect(status.presentationProblems.some((p) => p.fatal)).toBe(true);
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
