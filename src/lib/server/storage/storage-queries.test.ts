import { describe, expect, it } from 'vitest';

import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { createJobQuery } from './job/create-job-query.js';
import { jobByExternalIdQuery } from './job/job-by-external-id-query.js';
import { jobByIdQuery } from './job/job-by-id-query.js';
import { listActiveJobsQuery } from './job/list-active-jobs-query.js';
import { createJobApplicationQuery } from './job-application/create-job-application-query.js';
import { jobApplicationByIdQuery } from './job-application/job-application-by-id-query.js';
import { listJobApplicationsByJobQuery } from './job-application/list-job-applications-by-job-query.js';

describe('storage queries (memory)', () => {
	it('creates job, finds by id and external id, lists active', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-career-1',
				name: 'Engineer',
				description: 'Build things',
				company: 'Co',
				frameworks: [],
				skills: [],
				status: 'active'
			});

			expect(await jobByIdQuery({ id: job.id })).toEqual(job);
			expect(await jobByExternalIdQuery({ externalId: 'ext-career-1' })).toEqual(job);

			const active = await listActiveJobsQuery({});
			expect(active.map((j) => j.id)).toContain(job.id);
		});
	});

	it('creates job application and lists by job', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-2',
				name: 'Role',
				description: 'Desc',
				company: 'Co',
				frameworks: [],
				skills: []
			});

			const app = await createJobApplicationQuery({
				jobId: job.id,
				candidateName: 'Alex',
				candidateEmail: 'alex@example.com'
			});

			expect(await jobApplicationByIdQuery({ id: app.id })).toEqual(app);
			const forJob = await listJobApplicationsByJobQuery({ jobId: job.id });
			expect(forJob).toHaveLength(1);
			expect(forJob[0].id).toBe(app.id);
		});
	});
});
