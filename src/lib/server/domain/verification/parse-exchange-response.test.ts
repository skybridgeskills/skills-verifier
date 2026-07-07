import { describe, expect, it } from 'vitest';

import {
	extractPresentationChallenge,
	VerificationExchangeError
} from './parse-exchange-response.js';

describe('extractPresentationChallenge', () => {
	it('reads challenge/domain from a bare VPR object', () => {
		expect(
			extractPresentationChallenge({ challenge: 'chal-1', domain: 'https://verifier.test/v/e' })
		).toEqual({ challenge: 'chal-1', domain: 'https://verifier.test/v/e' });
	});

	it('reads challenge/domain from a participate-response envelope', () => {
		expect(
			extractPresentationChallenge({
				verifiablePresentationRequest: { challenge: 'chal-2', domain: 'https://verifier.test/v/f' }
			})
		).toEqual({ challenge: 'chal-2', domain: 'https://verifier.test/v/f' });
	});

	it('throws when challenge is missing', () => {
		expect(() => extractPresentationChallenge({ domain: 'https://verifier.test/v/e' })).toThrow(
			VerificationExchangeError
		);
	});

	it('throws when domain is missing', () => {
		expect(() => extractPresentationChallenge({ challenge: 'chal-3' })).toThrow(
			VerificationExchangeError
		);
	});

	it('throws on a non-object input', () => {
		expect(() => extractPresentationChallenge(null)).toThrow(VerificationExchangeError);
	});
});
