import { describe, expect, it } from 'vitest';

import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

import { createJobQuery } from '../job/create-job-query.js';

import { createMatchQuery } from './create-match-query.js';
import { deleteMatchQuery } from './delete-match-query.js';
import { matchByIdQuery } from './match-by-id-query.js';
import { updateMatchQuery } from './update-match-query.js';

const DAY_MS = 24 * 60 * 60 * 1000;

async function seedJobAndMatch() {
	const job = await createJobQuery({
		externalId: `ext-${Math.random()}`,
		name: 'Role',
		description: 'Desc',
		company: 'Co',
		frameworks: [],
		skills: [{ url: 'https://example.com/s1', text: 'Skill one', ctid: 'ce-s1' }]
	});
	const match = await createMatchQuery({ jobId: job.id });
	return { job, match };
}

describe('createMatchQuery (capability + expiry)', () => {
	it('mints a non-empty capability token and a ~30d archiveAfter', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { match } = await seedJobAndMatch();
			expect(match.capabilityToken).toBeTruthy();
			expect(match.capabilityToken).not.toBe(match.id); // distinct secret, not the id
			const delta = match.archiveAfter.getTime() - match.createdAt.getTime();
			expect(delta).toBe(30 * DAY_MS);
			// round-trips through storage including the new fields
			expect(await matchByIdQuery({ id: match.id })).toEqual(match);
		});
	});
});

describe('updateMatchQuery', () => {
	it('replaces assignments and extends the expiry', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { match } = await seedJobAndMatch();
			const updated = await updateMatchQuery({
				id: match.id,
				assignments: [
					{
						skillCtid: 'ce-s1',
						skillUrl: 'https://example.com/s1',
						credentialId: 'c1',
						narrative: 'demonstrates the skill'
					}
				],
				expiryDays: 90
			});
			expect(updated.assignments).toHaveLength(1);
			// Extended to ~now + 90d. The fake clock advances a few ms per call, so allow a small window.
			const delta = updated.archiveAfter.getTime() - match.createdAt.getTime();
			expect(delta).toBeGreaterThanOrEqual(90 * DAY_MS);
			expect(delta).toBeLessThan(90 * DAY_MS + 60_000);
			// Extending moved the archive date forward from the default (+30d).
			expect(updated.archiveAfter.getTime()).toBeGreaterThan(match.archiveAfter.getTime());
			// capability token unchanged
			expect(updated.capabilityToken).toBe(match.capabilityToken);
		});
	});

	it('throws for a missing match', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			await expect(updateMatchQuery({ id: 'nope', expiryDays: 30 })).rejects.toThrow();
		});
	});
});

describe('deleteMatchQuery', () => {
	it('hard-deletes the match', async () => {
		const ctx = await TestAppContext({});
		await runInContext(ctx, async () => {
			const { match } = await seedJobAndMatch();
			expect(await matchByIdQuery({ id: match.id })).not.toBeNull();
			await deleteMatchQuery({ id: match.id });
			expect(await matchByIdQuery({ id: match.id })).toBeNull();
		});
	});
});
