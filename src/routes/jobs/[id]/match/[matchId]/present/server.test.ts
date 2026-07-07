import { describe, expect, it } from 'vitest';

import type { AppContext } from '$lib/server/app-context.js';
import { createJobQuery } from '$lib/server/domain/job/create-job-query.js';
import { createMatchQuery } from '$lib/server/domain/match/create-match-query.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { VerificationExchangeError } from '$lib/server/domain/verification/parse-exchange-response.js';
import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { POST } from './+server.js';

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
	return { job, match };
}

/** Seed an active exchange so the endpoint has a `vcapi`/`exchangeId` to relay to. */
async function seedExchange(matchId: string) {
	await saveMatchCredentialsQuery({
		id: matchId,
		exchangeId: 'ex-1',
		vcapi: 'https://dcc.test/workflows/verify/exchanges/ex-1',
		exchangeState: 'pending'
	});
}

const VP = {
	'@context': ['https://www.w3.org/ns/credentials/v2'],
	type: ['VerifiablePresentation']
};

function postEvent(id: string, matchId: string, body: unknown) {
	return {
		params: { id, matchId },
		request: new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		locals: { requestId: 'test' }
	} as unknown as Parameters<typeof POST>[0];
}

describe('match [matchId]/present +server POST', () => {
	it('400 on a malformed JSON body', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await POST({
				params: { id: job.id, matchId: match.id },
				request: new Request('http://localhost/', { method: 'POST', body: 'not-json' }),
				locals: { requestId: 'test' }
			} as unknown as Parameters<typeof POST>[0]);
			expect(res.status).toBe(400);
		});
	});

	it('400 when verifiablePresentation is missing', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await POST(postEvent(job.id, match.id, { editToken: match.capabilityToken }));
			expect(res.status).toBe(400);
		});
	});

	it('404 for a missing / mismatched match', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job } = await seedJobAndMatch();
			const res = await POST(
				postEvent(job.id, 'nope', { editToken: 'x', verifiablePresentation: VP })
			);
			expect(res.status).toBe(404);
		});
	});

	it('410 once the match has expired', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await seedExchange(match.id);
			(ctx.database as { matchesById: Map<string, { archiveAfter: Date }> }).matchesById.get(
				match.id
			)!.archiveAfter = new Date(0);
			const res = await POST(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					verifiablePresentation: VP
				})
			);
			expect(res.status).toBe(410);
		});
	});

	it('403 with a bad capability token', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await seedExchange(match.id);
			const res = await POST(
				postEvent(job.id, match.id, { editToken: 'wrong', verifiablePresentation: VP })
			);
			expect(res.status).toBe(403);
		});
	});

	it('409 when the match has no active exchange', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			const res = await POST(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					verifiablePresentation: VP
				})
			);
			expect(res.status).toBe(409);
		});
	});

	it('relays a valid VP, persists complete + verified credentials', async () => {
		const ctx = await TestAppContext();
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await seedExchange(match.id);
			const res = await POST(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					verifiablePresentation: VP
				})
			);
			expect(res.status).toBe(200);
			const payload = (await res.json()) as { state: string; verifiedCredentials: unknown[] };
			expect(payload.state).toBe('complete');
			expect(payload.verifiedCredentials.length).toBeGreaterThan(0);

			const reread = await matchByIdQuery({ id: match.id });
			expect(reread!.exchangeState).toBe('complete');
			expect(reread!.verifiedCredentials.length).toBeGreaterThan(0);
		});
	});

	it('maps a service rejection (4xx) to 422', async () => {
		const ctx = (await TestAppContext()) as AppContext;
		ctx.verificationExchange = {
			...ctx.verificationExchange,
			submitPresentation: async () => {
				throw new VerificationExchangeError('rejected', { status: 422 });
			}
		};
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await seedExchange(match.id);
			const res = await POST(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					verifiablePresentation: VP
				})
			);
			expect(res.status).toBe(422);
		});
	});

	it('maps an upstream/transport failure to 502', async () => {
		const ctx = (await TestAppContext()) as AppContext;
		ctx.verificationExchange = {
			...ctx.verificationExchange,
			submitPresentation: async () => {
				throw new VerificationExchangeError('unreachable');
			}
		};
		await runInContext(ctx, async () => {
			const { job, match } = await seedJobAndMatch();
			await seedExchange(match.id);
			const res = await POST(
				postEvent(job.id, match.id, {
					editToken: match.capabilityToken,
					verifiablePresentation: VP
				})
			);
			expect(res.status).toBe(502);
		});
	});
});
