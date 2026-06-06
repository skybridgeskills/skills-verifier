import { error, redirect } from '@sveltejs/kit';

import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';
import { createMatchQuery } from '$lib/server/domain/match/create-match-query.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const job = await jobByIdQuery({ id: params.id });
	if (!job) {
		error(404, 'Job not found');
	}
	return { job };
};

export const actions: Actions = {
	createMatch: async ({ params }) => {
		// IDENTITY (fast-follow): ownership/session would attach here
		const job = await jobByIdQuery({ id: params.id });
		if (!job) {
			error(404, 'Job not found');
		}
		const match = await createMatchQuery({ jobId: params.id });
		redirect(303, `/jobs/${params.id}/match/${match.id}`);
	}
};
