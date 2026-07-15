import { timingSafeEqual } from 'node:crypto';

import { signSessionToken, verifySessionToken, type SessionPayload } from './session-token.js';

/**
 * Session lifetime shared by the issued token's `exp` and P2's session cookie expiry.
 * 30 days.
 */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AuthServiceConfig {
	adminPassword: string;
	authSecret: string;
	/** Token lifetime in ms; typically {@link SESSION_TTL_MS}. */
	sessionTtlMs: number;
	/** Injected clock so the service stays trivially testable. */
	nowMs: () => number;
}

export interface AuthService {
	/** Timing-safe comparison of a submitted password against the configured admin password. */
	verifyPassword: (submitted: string) => boolean;
	/** Issues a signed session token valid for `sessionTtlMs`. */
	issueToken: () => string;
	/** Verifies a token (signature + expiry); returns the payload or `null`. */
	verifyToken: (token: string) => SessionPayload | null;
}

/**
 * Single-password admin auth backed by an HMAC-SHA256 session token.
 * See `session-token.ts` for the token format.
 */
export function AuthService(cfg: AuthServiceConfig): AuthService {
	return {
		verifyPassword: (submitted: string) => {
			const a = Buffer.from(submitted);
			const b = Buffer.from(cfg.adminPassword);
			// timingSafeEqual throws on unequal lengths; a minor length leak is acceptable
			// for a single static password.
			if (a.length !== b.length) return false;
			return timingSafeEqual(a, b);
		},
		issueToken: () => {
			const iat = cfg.nowMs();
			return signSessionToken({ sub: 'admin', iat, exp: iat + cfg.sessionTtlMs }, cfg.authSecret);
		},
		verifyToken: (token: string) => verifySessionToken(token, cfg.authSecret, cfg.nowMs())
	};
}

export type AuthServiceCtx = {
	authService: AuthService;
};
