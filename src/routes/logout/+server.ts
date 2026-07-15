import { redirect } from '@sveltejs/kit';

import { clearSessionCookie } from '$lib/server/services/auth/store-session-cookie.js';

import type { RequestHandler } from './$types';

/**
 * Clears the session cookie and returns to the home page. POST-only so logout
 * can't be triggered cross-site via a GET (e.g. `<img src="/logout">`);
 * SvelteKit's origin check protects the POST form in the header.
 */
export const POST: RequestHandler = ({ cookies }) => {
	clearSessionCookie(cookies);
	redirect(303, '/');
};
