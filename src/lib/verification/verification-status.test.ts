import { describe, expect, it } from 'vitest';

import type { VerificationProblem } from '$lib/server/domain/verification/verification-exchange.js';

import { deriveVerificationOutcome } from './verification-status.js';

const warning: VerificationProblem = { title: 'Untrusted issuer', fatal: false };
const critical: VerificationProblem = { title: 'Invalid Signature', fatal: true };

describe('deriveVerificationOutcome', () => {
	it('is valid when there are no problems', () => {
		expect(deriveVerificationOutcome([])).toBe('valid');
	});

	it('is warning when problems exist but none are fatal', () => {
		expect(deriveVerificationOutcome([warning, warning])).toBe('warning');
	});

	it('is invalid when any problem is fatal', () => {
		expect(deriveVerificationOutcome([warning, critical])).toBe('invalid');
	});
});
