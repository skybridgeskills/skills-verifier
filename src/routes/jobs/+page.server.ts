import { listActiveJobsQuery } from '$lib/server/domain/job/list-active-jobs-query.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const jobs = await listActiveJobsQuery({});
	return { jobs };
};
