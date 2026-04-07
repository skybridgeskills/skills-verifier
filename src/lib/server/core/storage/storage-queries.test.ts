import { describe, expect, it } from 'vitest';

import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { createJobQuery } from '../../domain/job/create-job-query.js';
import { jobByExternalIdQuery } from '../../domain/job/job-by-external-id-query.js';
import { jobByIdQuery } from '../../domain/job/job-by-id-query.js';
import { listActiveJobsQuery } from '../../domain/job/list-active-jobs-query.js';
import { createJobAppQuery } from '../../domain/job-app/create-job-app-query.js';
import { jobAppByIdQuery } from '../../domain/job-app/job-app-by-id-query.js';
import { listJobAppsByJobQuery } from '../../domain/job-app/list-job-apps-by-job-query.js';

describe('storage queries (memory)', () => {
	it('creates job, finds by id and external id, lists active', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-career-1',
				name: 'Engineer',
				description: 'Build things',
				company: 'Co',
				frameworks: [],
				skills: [{ url: 'https://example.com/s1', text: 'Skill one', ctid: 'ce-s1' }],
				status: 'active'
			});

			expect(await jobByIdQuery({ id: job.id })).toEqual(job);
			expect(await jobByExternalIdQuery({ externalId: 'ext-career-1' })).toEqual(job);

			const active = await listActiveJobsQuery({});
			expect(active.map((j) => j.id)).toContain(job.id);
		});
	});

	it('creates job app and lists by job', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-2',
				name: 'Role',
				description: 'Desc',
				company: 'Co',
				frameworks: [],
				skills: [{ url: 'https://example.com/s2', text: 'Skill two', ctid: 'ce-s2' }]
			});

			const app = await createJobAppQuery({
				jobId: job.id,
				candidateName: 'Alex',
				candidateEmail: 'alex@example.com'
			});

			expect(await jobAppByIdQuery({ id: app.id })).toEqual(app);
			const forJob = await listJobAppsByJobQuery({ jobId: job.id });
			expect(forJob).toHaveLength(1);
			expect(forJob[0].id).toBe(app.id);
		});
	});
});
