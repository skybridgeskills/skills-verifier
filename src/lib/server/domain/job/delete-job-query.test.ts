import { describe, expect, it } from 'vitest';

import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { createJobAppQuery } from '../job-app/create-job-app-query.js';
import { jobAppByIdQuery } from '../job-app/job-app-by-id-query.js';
import { createMatchQuery } from '../match/create-match-query.js';
import { matchByIdQuery } from '../match/match-by-id-query.js';

import { createJobQuery } from './create-job-query.js';
import { deleteJobQuery } from './delete-job-query.js';
import { jobByIdQuery } from './job-by-id-query.js';

function jobInput(externalId: string) {
	return {
		externalId,
		name: 'Role',
		description: 'Desc',
		company: 'Co',
		frameworks: [],
		skills: [{ url: 'https://example.com/s1', text: 'Skill one', ctid: 'ce-s1' }]
	};
}

describe('deleteJobQuery (cascade)', () => {
	it('removes the job and only its matches + job-apps', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery(jobInput('ext-target'));
			const match1 = await createMatchQuery({ jobId: job.id });
			const match2 = await createMatchQuery({ jobId: job.id });
			const app1 = await createJobAppQuery({
				jobId: job.id,
				candidateName: 'Ada',
				candidateEmail: 'ada@example.com',
				status: 'pending'
			});

			// Unrelated job with its own match + app must survive.
			const other = await createJobQuery(jobInput('ext-other'));
			const otherMatch = await createMatchQuery({ jobId: other.id });
			const otherApp = await createJobAppQuery({
				jobId: other.id,
				candidateName: 'Grace',
				candidateEmail: 'grace@example.com',
				status: 'pending'
			});

			await deleteJobQuery({ id: job.id });

			// Target job and its children are gone.
			expect(await jobByIdQuery({ id: job.id })).toBeNull();
			expect(await matchByIdQuery({ id: match1.id })).toBeNull();
			expect(await matchByIdQuery({ id: match2.id })).toBeNull();
			expect(await jobAppByIdQuery({ id: app1.id })).toBeNull();

			// Unrelated job and its children remain.
			expect(await jobByIdQuery({ id: other.id })).not.toBeNull();
			expect(await matchByIdQuery({ id: otherMatch.id })).not.toBeNull();
			expect(await jobAppByIdQuery({ id: otherApp.id })).not.toBeNull();
		});
	});

	it('is idempotent — deleting an already-missing job is a no-op', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const job = await createJobQuery(jobInput('ext-idem'));
			await deleteJobQuery({ id: job.id });
			await expect(deleteJobQuery({ id: job.id })).resolves.toBeUndefined();
			await expect(deleteJobQuery({ id: 'never-existed' })).resolves.toBeUndefined();
		});
	});
});
