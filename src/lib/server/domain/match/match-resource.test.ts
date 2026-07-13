import { describe, expect, it } from 'vitest';

import { CreateMatchParams, MatchResource } from './match-resource.js';

describe('MatchResource', () => {
	it('applies defaults for exchange state, arrays, and capability token', () => {
		const match = MatchResource({
			id: 'm1',
			createdAt: new Date(),
			jobId: 'job-1',
			archiveAfter: new Date()
		});
		expect(match.exchangeState).toBe('none');
		expect(match.verifiedCredentials).toEqual([]);
		expect(match.presentationProblems).toEqual([]);
		expect(match.assignments).toEqual([]);
		expect(match.exchangeId).toBeUndefined();
		expect(match.vcapi).toBeUndefined();
		// Absent capability token defaults to '' → the match is read-only (never matches a token).
		expect(match.capabilityToken).toBe('');
	});

	it('defaults a credential to verified with no problems, and preserves supplied problems', () => {
		const match = MatchResource({
			id: 'm3',
			createdAt: new Date(),
			jobId: 'job-3',
			archiveAfter: new Date(),
			verifiedCredentials: [
				// Legacy/complete-path cred: verified/problems default.
				{ credentialId: 'c1', raw: {} },
				// Invalid-path cred carries a fatal problem.
				{
					credentialId: 'c2',
					raw: {},
					verified: false,
					problems: [{ title: 'Invalid Signature', fatal: true }]
				}
			],
			presentationProblems: [{ title: 'VP failed', fatal: true }]
		});
		expect(match.verifiedCredentials[0]).toMatchObject({ verified: true, problems: [] });
		expect(match.verifiedCredentials[1]).toMatchObject({
			verified: false,
			problems: [{ title: 'Invalid Signature', fatal: true }]
		});
		expect(match.presentationProblems).toEqual([{ title: 'VP failed', fatal: true }]);
	});

	it('preserves provided exchange and credential fields', () => {
		const match = MatchResource({
			id: 'm2',
			createdAt: new Date(),
			jobId: 'job-2',
			archiveAfter: new Date(),
			exchangeId: 'ex-1',
			vcapi: 'https://dcc.test/exchanges/ex-1',
			exchangeState: 'active',
			verifiedCredentials: [{ credentialId: 'c1', raw: { foo: 'bar' } }],
			assignments: [
				{
					skillCtid: 'ce-s1',
					skillUrl: 'https://example.com/s1',
					credentialId: 'c1',
					narrative: 'matches well'
				}
			]
		});
		expect(match.exchangeState).toBe('active');
		expect(match.vcapi).toBe('https://dcc.test/exchanges/ex-1');
		expect(match.verifiedCredentials).toHaveLength(1);
		expect(match.assignments[0].credentialId).toBe('c1');
	});
});

describe('CreateMatchParams', () => {
	it('requires jobId', () => {
		const r = CreateMatchParams.safeParse({});
		expect(r.success).toBe(false);
	});

	it('accepts a jobId', () => {
		const r = CreateMatchParams.safeParse({ jobId: 'job-1' });
		expect(r.success).toBe(true);
		if (r.success) expect(r.data.jobId).toBe('job-1');
	});
});
