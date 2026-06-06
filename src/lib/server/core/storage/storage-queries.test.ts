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
import { createMatchQuery } from '../../domain/match/create-match-query.js';
import { listMatchesByJobQuery } from '../../domain/match/list-matches-by-job-query.js';
import { matchByIdQuery } from '../../domain/match/match-by-id-query.js';
import { saveMatchAssignmentsQuery } from '../../domain/match/save-match-assignments-query.js';
import { saveMatchCredentialsQuery } from '../../domain/match/save-match-credentials-query.js';

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

	it('creates a match, round-trips by id, and lists by job', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-match-1',
				name: 'Role',
				description: 'Desc',
				company: 'Co',
				frameworks: [],
				skills: [{ url: 'https://example.com/s3', text: 'Skill three', ctid: 'ce-s3' }]
			});

			const match = await createMatchQuery({ jobId: job.id });
			expect(match.exchangeState).toBe('none');
			expect(match.verifiedCredentials).toEqual([]);
			expect(match.assignments).toEqual([]);

			expect(await matchByIdQuery({ id: match.id })).toEqual(match);

			const otherJob = await createJobQuery({
				externalId: 'ext-match-2',
				name: 'Other',
				description: 'Desc',
				company: 'Co',
				frameworks: [],
				skills: [{ url: 'https://example.com/s4', text: 'Skill four', ctid: 'ce-s4' }]
			});
			await createMatchQuery({ jobId: otherJob.id });

			const forJob = await listMatchesByJobQuery({ jobId: job.id });
			expect(forJob).toHaveLength(1);
			expect(forJob[0].id).toBe(match.id);
		});
	});

	it('saves match credentials and assignments', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery({
				externalId: 'ext-match-3',
				name: 'Role',
				description: 'Desc',
				company: 'Co',
				frameworks: [],
				skills: [{ url: 'https://example.com/s5', text: 'Skill five', ctid: 'ce-s5' }]
			});
			const match = await createMatchQuery({ jobId: job.id });

			const withCreds = await saveMatchCredentialsQuery({
				id: match.id,
				exchangeId: 'ex-1',
				vcapi: 'https://dcc.test/exchanges/ex-1',
				exchangeState: 'active',
				verifiedCredentials: [{ credentialId: 'c1', raw: { foo: 'bar' }, name: 'Cred One' }]
			});
			expect(withCreds.exchangeId).toBe('ex-1');
			expect(withCreds.vcapi).toBe('https://dcc.test/exchanges/ex-1');
			expect(withCreds.exchangeState).toBe('active');
			expect(withCreds.verifiedCredentials).toHaveLength(1);
			expect(withCreds.verifiedCredentials[0].raw).toEqual({ foo: 'bar' });

			const withAssignments = await saveMatchAssignmentsQuery({
				id: match.id,
				assignments: [
					{
						skillCtid: 'ce-s1',
						skillUrl: 'https://example.com/s1',
						credentialId: 'c1',
						narrative: 'demonstrates the skill'
					}
				]
			});
			expect(withAssignments.assignments).toHaveLength(1);
			expect(withAssignments.assignments[0].credentialId).toBe('c1');
			// Credentials persisted from the prior save remain intact.
			expect(withAssignments.verifiedCredentials).toHaveLength(1);
			expect(withAssignments.exchangeState).toBe('active');
			// vcapi persisted from the prior credentials save remains intact.
			expect(withAssignments.vcapi).toBe('https://dcc.test/exchanges/ex-1');

			const reread = await matchByIdQuery({ id: match.id });
			expect(reread).toEqual(withAssignments);
		});
	});
});
