import { describe, expect, it } from 'vitest';

import { signSessionToken, verifySessionToken, type SessionPayload } from './session-token.js';

const SECRET = 'unit-test-secret';

function payload(overrides: Partial<SessionPayload> = {}): SessionPayload {
	return { sub: 'admin', iat: 1_000, exp: 10_000, ...overrides };
}

describe('session-token', () => {
	it('round-trips a signed payload', () => {
		const token = signSessionToken(payload(), SECRET);
		expect(verifySessionToken(token, SECRET, 5_000)).toEqual(payload());
	});

	it('rejects a tampered body', () => {
		const token = signSessionToken(payload(), SECRET);
		const [body, sig] = token.split('.');
		const tamperedBody = Buffer.from(JSON.stringify(payload({ exp: 99_999_999 }))).toString(
			'base64url'
		);
		expect(verifySessionToken(`${tamperedBody}.${sig}`, SECRET, 5_000)).toBeNull();
		// original still valid to confirm the split was meaningful
		expect(verifySessionToken(`${body}.${sig}`, SECRET, 5_000)).not.toBeNull();
	});

	it('rejects a tampered signature', () => {
		const token = signSessionToken(payload(), SECRET);
		const [body] = token.split('.');
		expect(verifySessionToken(`${body}.not-the-real-signature`, SECRET, 5_000)).toBeNull();
	});

	it('rejects a token signed with a different secret', () => {
		const token = signSessionToken(payload(), 'other-secret');
		expect(verifySessionToken(token, SECRET, 5_000)).toBeNull();
	});

	it('rejects an expired token (exp <= now)', () => {
		const token = signSessionToken(payload({ exp: 10_000 }), SECRET);
		expect(verifySessionToken(token, SECRET, 10_000)).toBeNull();
		expect(verifySessionToken(token, SECRET, 10_001)).toBeNull();
		expect(verifySessionToken(token, SECRET, 9_999)).not.toBeNull();
	});

	it('rejects malformed tokens', () => {
		expect(verifySessionToken('', SECRET, 5_000)).toBeNull();
		expect(verifySessionToken('no-dot', SECRET, 5_000)).toBeNull();
		expect(verifySessionToken('.leadingdot', SECRET, 5_000)).toBeNull();
	});
});
