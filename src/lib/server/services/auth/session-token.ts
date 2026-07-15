import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Payload carried by a signed admin session token. Times are ms-epoch integers.
 */
export interface SessionPayload {
	sub: 'admin';
	iat: number; // ms epoch
	exp: number; // ms epoch
}

function b64url(input: Buffer | string): string {
	return Buffer.from(input).toString('base64url');
}

/**
 * Signs a session payload as `<base64url(payload)>.<base64url(HMAC-SHA256)>`.
 */
export function signSessionToken(payload: SessionPayload, secret: string): string {
	const body = b64url(JSON.stringify(payload));
	const sig = createHmac('sha256', secret).update(body).digest('base64url');
	return `${body}.${sig}`;
}

/**
 * Verifies a session token: constant-time signature check, then `exp` check.
 * Returns the payload on success or `null` on any failure (bad shape, tampered
 * body/signature, wrong secret, or expired).
 */
export function verifySessionToken(
	token: string,
	secret: string,
	nowMs: number
): SessionPayload | null {
	const dot = token.indexOf('.');
	if (dot <= 0) return null;
	const body = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	const expected = createHmac('sha256', secret).update(body).digest('base64url');
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
		if (payload.sub !== 'admin' || typeof payload.exp !== 'number') return null;
		if (payload.exp <= nowMs) return null;
		return payload;
	} catch {
		return null;
	}
}
