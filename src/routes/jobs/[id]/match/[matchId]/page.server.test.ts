import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { appContext } from '$lib/server/app-context.js';
import { MemoryDatabase } from '$lib/server/core/storage/memory-database.js';
import { createJobQuery } from '$lib/server/domain/job/create-job-query.js';
import { createMatchQuery } from '$lib/server/domain/match/create-match-query.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { actions, load } from './+page.server.js';

const SKILL = { url: 'https://example.com/s', text: 'Skill', ctid: 'ce-s' };

async function seedJobAndMatch() {
	const job = await createJobQuery({
		externalId: `ext-${Math.random()}`,
		name: 'Role',
		description: 'Desc',
		company: 'Co',
		frameworks: [],
		skills: [SKILL]
	});
	const match = await createMatchQuery({ jobId: job.id });
	return { job, match };
}

type LoadResult = {
	match: Record<string, unknown>;
	canEdit: boolean;
	editToken: string | null;
};

function loadEvent(id: string, matchId: string, search = '') {
	return {
		params: { id, matchId },
		url: new URL(`http://localhost/jobs/${id}/match/${matchId}${search}`)
	} as unknown as Parameters<typeof load>[0];
}

async function runLoad(id: string, matchId: string, search = ''): Promise<LoadResult> {
	return (await load(loadEvent(id, matchId, search))) as unknown as LoadResult;
}

function memoryDb(): MemoryDatabase {
	return appContext().database as MemoryDatabase;
}

function postEvent(id: string, matchId: string, fields: Record<string, string>) {
	const fd = new FormData();
	for (const [k, v] of Object.entries(fields)) fd.set(k, v);
	return {
		params: { id, matchId },
		request: new Request('http://localhost/', { method: 'POST', body: fd }),
		locals: { requestId: 'test' }
	} as unknown as Parameters<(typeof actions)['saveAssignments']>[0];
}

describe('match [matchId] +page.server', () => {
	it('read-only load strips the capability token and reports canEdit=false', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const result = await runLoad(job.id, match.id);
			expect(result.canEdit).toBe(false);
			expect(result.editToken).toBeNull();
			expect('capabilityToken' in result.match).toBe(false);
		});
	});

	it('load with a valid token unlocks edit and echoes the token', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const result = await runLoad(job.id, match.id, `?edit=${match.capabilityToken}`);
			expect(result.canEdit).toBe(true);
			expect(result.editToken).toBe(match.capabilityToken);
		});
	});

	it('load returns 410 once the match has expired', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			memoryDb().matchesById.get(match.id)!.archiveAfter = new Date(0);
			await expect(runLoad(job.id, match.id)).rejects.toMatchObject({ status: 410 });
		});
	});

	it('saveAssignments rejects an invalid token with 403', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await actions.saveAssignments(
				postEvent(job.id, match.id, { editToken: 'wrong', assignmentsJson: '[]' })
			);
			expect(res).toMatchObject({ status: 403 });
		});
	});

	it('saveAssignments with a valid token persists assignments and extends expiry', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await saveMatchCredentialsQuery({
				id: match.id,
				exchangeId: 'ex-1',
				vcapi: 'https://dcc.test/ex-1',
				exchangeState: 'active',
				verifiedCredentials: [{ credentialId: 'c1', raw: {}, name: 'Cred' }]
			});
			const assignments = [
				{ skillCtid: SKILL.ctid, skillUrl: SKILL.url, credentialId: 'c1', narrative: 'why' }
			];
			const res = await actions.saveAssignments(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					assignmentsJson: JSON.stringify(assignments),
					expiryDays: '90'
				})
			);
			expect(res).toEqual({ success: true });
			const reread = await matchByIdQuery({ id: match.id });
			expect(reread!.assignments).toHaveLength(1);
			// 90-day preset pushes archiveAfter well beyond the default +30d.
			expect(reread!.archiveAfter.getTime()).toBeGreaterThan(match.archiveAfter.getTime());
		});
	});

	it('saveAssignments accepts an assignment to a persisted-but-invalid credential', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			// An invalid exchange persisted a credential that failed verification (fatal problem).
			await saveMatchCredentialsQuery({
				id: match.id,
				exchangeId: 'ex-1',
				vcapi: 'https://dcc.test/ex-1',
				exchangeState: 'invalid',
				verifiedCredentials: [
					{
						credentialId: 'c-bad',
						raw: {},
						name: 'Unverified Cred',
						verified: false,
						problems: [{ title: 'Invalid Signature', fatal: true }]
					}
				],
				presentationProblems: [{ title: 'VP failed', fatal: true }]
			});
			const assignments = [
				{
					skillCtid: SKILL.ctid,
					skillUrl: SKILL.url,
					credentialId: 'c-bad',
					narrative: 'still useful'
				}
			];
			const res = await actions.saveAssignments(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					assignmentsJson: JSON.stringify(assignments)
				})
			);
			expect(res).toEqual({ success: true });
			const reread = await matchByIdQuery({ id: match.id });
			expect(reread!.assignments).toHaveLength(1);
			expect(reread!.assignments[0].credentialId).toBe('c-bad');
		});
	});

	it('deleteMatch requires a valid token and removes the match', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();

			const denied = await actions.deleteMatch(postEvent(job.id, match.id, { editToken: 'wrong' }));
			expect(denied).toMatchObject({ status: 403 });
			expect(await matchByIdQuery({ id: match.id })).not.toBeNull();

			let redirected = false;
			try {
				await actions.deleteMatch(
					postEvent(job.id, match.id, { editToken: match.capabilityToken })
				);
			} catch (e) {
				redirected = isRedirect(e);
				expect(isRedirect(e) && e.location).toBe(`/jobs/${job.id}`);
			}
			expect(redirected).toBe(true);
			expect(await matchByIdQuery({ id: match.id })).toBeNull();
		});
	});

	it('load surfaces a 404 for a missing match', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { job } = await seedJobAndMatch();
			let err: unknown;
			try {
				await runLoad(job.id, 'nope');
			} catch (e) {
				err = e;
			}
			expect(isHttpError(err) && err.status).toBe(404);
		});
	});
});
