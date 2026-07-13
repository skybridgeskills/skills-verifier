import { describe, expect, it } from 'vitest';

import type { AppContext } from '$lib/server/app-context.js';
import { createJobQuery } from '$lib/server/domain/job/create-job-query.js';
import { createMatchQuery } from '$lib/server/domain/match/create-match-query.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import type { ExchangeStatus } from '$lib/server/domain/verification/verification-exchange.js';
import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { GET } from './+server.js';

async function seedJobAndMatch() {
	const job = await createJobQuery({
		externalId: `ext-${Math.random()}`,
		name: 'Role',
		description: 'Desc',
		company: 'Co',
		frameworks: [],
		skills: [{ url: 'https://example.com/s', text: 'Skill', ctid: 'ce-s' }]
	});
	const match = await createMatchQuery({ jobId: job.id });
	// Seed an active exchange so the status route has an exchangeId/vcapi to poll.
	await saveMatchCredentialsQuery({
		id: match.id,
		exchangeId: 'ex-1',
		vcapi: 'https://dcc.test/workflows/verify/exchanges/ex-1',
		exchangeState: 'pending'
	});
	return { job, match };
}

/** Override the context's verification exchange so the poll returns a fixed status. */
function withStatus(ctx: AppContext, status: ExchangeStatus): AppContext {
	ctx.verificationExchange = {
		...ctx.verificationExchange,
		getExchangeStatus: async () => status
	};
	return ctx;
}

function getEvent(id: string, matchId: string) {
	return {
		params: { id, matchId },
		locals: { requestId: 'test' }
	} as unknown as Parameters<typeof GET>[0];
}

describe('match [matchId]/status +server GET', () => {
	it('persists + returns credentials and presentation problems on an invalid result', async () => {
		const ctx = (await TestAppContext()) as AppContext;
		const invalid: ExchangeStatus = {
			state: 'invalid',
			verifiedCredentials: [
				{
					credentialId: 'c-bad',
					raw: { id: 'c-bad' },
					name: 'Badge Summit',
					verified: false,
					problems: [{ title: 'Invalid Signature', fatal: true }]
				}
			],
			presentationProblems: [{ title: 'VP signature failed', fatal: true }]
		};
		await runInContext(withStatus(ctx, invalid), async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await GET(getEvent(job.id, match.id));
			expect(res.status).toBe(200);
			const payload = (await res.json()) as {
				state: string;
				verifiedCredentials: unknown[];
				presentationProblems: unknown[];
			};
			expect(payload.state).toBe('invalid');
			expect(payload.verifiedCredentials).toHaveLength(1);
			expect(payload.presentationProblems).toHaveLength(1);

			const reread = await matchByIdQuery({ id: match.id });
			expect(reread!.exchangeState).toBe('invalid');
			expect(reread!.verifiedCredentials).toHaveLength(1);
			expect(reread!.verifiedCredentials[0].verified).toBe(false);
			expect(reread!.presentationProblems).toHaveLength(1);
		});
	});

	it('returns invalid with empty arrays when the result carried no usable credentials', async () => {
		const ctx = (await TestAppContext()) as AppContext;
		const invalidEmpty: ExchangeStatus = {
			state: 'invalid',
			verifiedCredentials: [],
			presentationProblems: []
		};
		await runInContext(withStatus(ctx, invalidEmpty), async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await GET(getEvent(job.id, match.id));
			expect(res.status).toBe(200);
			const payload = (await res.json()) as { state: string; verifiedCredentials: unknown[] };
			expect(payload.state).toBe('invalid');
			expect(payload.verifiedCredentials).toEqual([]);

			const reread = await matchByIdQuery({ id: match.id });
			expect(reread!.exchangeState).toBe('invalid');
			expect(reread!.verifiedCredentials).toEqual([]);
		});
	});
});
