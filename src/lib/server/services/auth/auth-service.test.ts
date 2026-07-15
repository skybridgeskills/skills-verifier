import { describe, expect, it } from 'vitest';

import { AuthService, SESSION_TTL_MS } from './auth-service.js';

function makeService(now: () => number = () => 1_000) {
	return AuthService({
		adminPassword: 'correct horse',
		authSecret: 'unit-test-secret',
		sessionTtlMs: SESSION_TTL_MS,
		nowMs: now
	});
}

describe('AuthService', () => {
	describe('verifyPassword', () => {
		it('accepts the exact password', () => {
			expect(makeService().verifyPassword('correct horse')).toBe(true);
		});

		it('rejects a wrong password of equal length', () => {
			expect(makeService().verifyPassword('correct horze')).toBe(false);
		});

		it('rejects a wrong password of different length', () => {
			expect(makeService().verifyPassword('nope')).toBe(false);
			expect(makeService().verifyPassword('')).toBe(false);
		});
	});

	describe('issueToken / verifyToken', () => {
		it('issues a token that verifies and carries the admin payload', () => {
			const svc = makeService(() => 1_000);
			const payload = svc.verifyToken(svc.issueToken());
			expect(payload).not.toBeNull();
			expect(payload?.sub).toBe('admin');
			expect(payload?.iat).toBe(1_000);
			expect(payload?.exp).toBe(1_000 + SESSION_TTL_MS);
		});

		it('rejects a token once the clock passes its expiry', () => {
			let now = 1_000;
			const svc = makeService(() => now);
			const token = svc.issueToken();
			expect(svc.verifyToken(token)).not.toBeNull();
			now = 1_000 + SESSION_TTL_MS + 1;
			expect(svc.verifyToken(token)).toBeNull();
		});

		it('rejects garbage tokens', () => {
			expect(makeService().verifyToken('garbage')).toBeNull();
		});
	});
});
