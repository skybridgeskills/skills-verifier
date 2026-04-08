import { error } from '@sveltejs/kit';

import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const job = await jobByIdQuery({ id: params.id });
	if (!job) {
		error(404, 'Job not found');
	}
	return { job };
};
