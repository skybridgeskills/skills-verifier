import { fail, redirect } from '@sveltejs/kit';

import { appContext } from '$lib/server/app-context.js';
import { safeNext } from '$lib/server/services/auth/safe-next.js';
import { setSessionCookie } from '$lib/server/services/auth/store-session-cookie.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.admin) redirect(303, '/');
	return { next: safeNext(url.searchParams.get('next')) };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const fd = await request.formData();
		const password = String(fd.get('password') ?? '');
		const next = safeNext(String(fd.get('next') ?? ''));

		const { authService } = appContext();
		if (!authService.verifyPassword(password)) {
			return fail(400, { error: 'Invalid password', next });
		}

		setSessionCookie(cookies, authService.issueToken(), url.protocol === 'https:');
		redirect(303, next);
	}
};
