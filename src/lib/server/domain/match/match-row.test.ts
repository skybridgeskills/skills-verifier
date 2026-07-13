import { describe, expect, it } from 'vitest';

import { MatchResource } from './match-resource.js';
import { matchMetaKeys, matchToRow, parseMatchRow, rowToMatchResource } from './match-row.js';

const CREATED = new Date('2026-07-12T00:00:00.000Z');
const ARCHIVE = new Date('2026-08-11T00:00:00.000Z');

describe('match-row round-trip', () => {
	it('preserves per-credential problems + presentation problems through row mapping', () => {
		const match = MatchResource({
			id: 'm1',
			createdAt: CREATED,
			jobId: 'job-1',
			archiveAfter: ARCHIVE,
			exchangeState: 'invalid',
			verifiedCredentials: [
				{
					credentialId: 'c1',
					raw: { id: 'c1' },
					name: 'Badge Summit',
					verified: false,
					problems: [{ check: 'proof.signature', title: 'Invalid Signature', fatal: true }]
				},
				{
					credentialId: 'c2',
					raw: { id: 'c2' },
					verified: true,
					problems: [{ title: 'Untrusted issuer', fatal: false }]
				}
			],
			presentationProblems: [{ title: 'VP signature failed', fatal: true }]
		});

		// Simulate the DynamoDB write/read cycle (JSON drops undefined + Dates → ISO strings on write).
		const row = parseMatchRow(JSON.parse(JSON.stringify(matchToRow(match))));
		const back = rowToMatchResource(row);

		expect(back.exchangeState).toBe('invalid');
		expect(back.verifiedCredentials[0]).toMatchObject({
			credentialId: 'c1',
			verified: false,
			problems: [{ check: 'proof.signature', title: 'Invalid Signature', fatal: true }]
		});
		expect(back.verifiedCredentials[1]).toMatchObject({
			credentialId: 'c2',
			verified: true,
			problems: [{ title: 'Untrusted issuer', fatal: false }]
		});
		expect(back.presentationProblems).toEqual([{ title: 'VP signature failed', fatal: true }]);
	});

	it('parses a legacy row (no verified/problems/presentationProblems) with defaults', () => {
		const legacy = {
			...matchMetaKeys('m-legacy', 'job-1', CREATED.toISOString()),
			id: 'm-legacy',
			jobId: 'job-1',
			exchangeState: 'complete',
			// Legacy credential shape: only credentialId/raw/name, no verified/problems.
			verifiedCredentials: [{ credentialId: 'c-old', raw: { id: 'c-old' }, name: 'Legacy' }],
			assignments: [],
			createdAt: CREATED.toISOString()
			// no presentationProblems, capabilityToken, or archiveAfter keys at all
		};

		const back = rowToMatchResource(parseMatchRow(legacy));

		expect(back.verifiedCredentials[0]).toMatchObject({
			credentialId: 'c-old',
			verified: true,
			problems: []
		});
		expect(back.presentationProblems).toEqual([]);
		expect(back.capabilityToken).toBe('');
	});
});
