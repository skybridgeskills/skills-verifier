import { error, redirect } from '@sveltejs/kit';

import { deleteJobQuery } from '$lib/server/domain/job/delete-job-query.js';
import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';
import { createMatchQuery } from '$lib/server/domain/match/create-match-query.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const job = await jobByIdQuery({ id: params.id });
	if (!job) {
		error(404, 'Job not found');
	}
	return { job, admin: locals.admin };
};

export const actions: Actions = {
	createMatch: async ({ params }) => {
		// IDENTITY (fast-follow): ownership/session would attach here
		const job = await jobByIdQuery({ id: params.id });
		if (!job) {
			error(404, 'Job not found');
		}
		const match = await createMatchQuery({ jobId: params.id });
		// Run the whole create flow in edit mode: the capability token unlocks assign/save/delete.
		redirect(303, `/jobs/${params.id}/match/${match.id}?edit=${match.capabilityToken}`);
	},

	// Auth-gated hard delete (test-data cleanup). The server check is authoritative —
	// hiding the button is not enough.
	deleteJob: async ({ params, locals }) => {
		if (!locals.admin) {
			error(403, 'Not authorized');
		}
		await deleteJobQuery({ id: params.id });
		redirect(303, '/jobs');
	}
};
