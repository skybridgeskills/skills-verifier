import type { Cookies } from '@sveltejs/kit';

import { SESSION_TTL_MS } from './auth-service.js';

export const SESSION_COOKIE = 'sessionToken';

/**
 * Sets the signed admin session cookie. `secure` should be `true` on https so
 * local http dev still receives the cookie. `httpOnly` + `sameSite=lax` guard
 * against script access and cross-site sends.
 */
export function setSessionCookie(cookies: Cookies, token: string, secure: boolean): void {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: new Date(Date.now() + SESSION_TTL_MS)
	});
}

/** Clears the session cookie (logout). */
export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
