import { describe, expect, it } from 'vitest';

import {
	extractPresentationChallenge,
	extractPresentationProblems,
	extractVerifiedCredentials,
	VerificationExchangeError
} from './parse-exchange-response.js';

/** A trimmed verifier-core result mirroring the invalid example in notes.md. */
function invalidResult() {
	return {
		variables: {
			results: {
				default: {
					presentationResults: [
						{
							id: 'cryptographic.proof.signature',
							fatal: true,
							outcome: {
								status: 'failure',
								problems: [{ title: 'Invalid Signature', detail: 'VP holder-binding proof failed' }]
							}
						}
					],
					credentialResults: [
						{
							verified: false,
							verifiableCredential: {
								id: 'urn:uuid:cred-1',
								name: 'Badge Summit',
								issuer: { name: 'Summit' }
							},
							results: [
								{
									id: 'cryptographic.proof.signature',
									fatal: true,
									outcome: { status: 'failure', problems: [{ title: 'Invalid Signature' }] }
								},
								{
									id: 'registry.issuer',
									fatal: false,
									outcome: { status: 'failure', problems: [{ title: 'Untrusted issuer' }] }
								},
								{
									id: 'schema',
									fatal: false,
									outcome: { status: 'success' } // success → not a problem
								}
							]
						},
						{
							verified: true,
							verifiableCredential: { id: 'urn:uuid:cred-2', name: 'Wonderful' },
							results: [
								{
									id: 'registry.issuer',
									fatal: false,
									// No `problems` array → falls back to the check id as the title.
									outcome: { status: 'failure' }
								}
							]
						}
					]
				}
			}
		}
	};
}

describe('extractPresentationChallenge', () => {
	it('reads challenge/domain from a bare VPR object', () => {
		expect(
			extractPresentationChallenge({ challenge: 'chal-1', domain: 'https://verifier.test/v/e' })
		).toEqual({ challenge: 'chal-1', domain: 'https://verifier.test/v/e' });
	});

	it('reads challenge/domain from a participate-response envelope', () => {
		expect(
			extractPresentationChallenge({
				verifiablePresentationRequest: { challenge: 'chal-2', domain: 'https://verifier.test/v/f' }
			})
		).toEqual({ challenge: 'chal-2', domain: 'https://verifier.test/v/f' });
	});

	it('throws when challenge is missing', () => {
		expect(() => extractPresentationChallenge({ domain: 'https://verifier.test/v/e' })).toThrow(
			VerificationExchangeError
		);
	});

	it('throws when domain is missing', () => {
		expect(() => extractPresentationChallenge({ challenge: 'chal-3' })).toThrow(
			VerificationExchangeError
		);
	});

	it('throws on a non-object input', () => {
		expect(() => extractPresentationChallenge(null)).toThrow(VerificationExchangeError);
	});
});

describe('extractVerifiedCredentials', () => {
	it('extracts per-credential verified + distilled problems (fatal vs non-fatal)', () => {
		const creds = extractVerifiedCredentials(invalidResult());
		expect(creds).toHaveLength(2);

		const [first, second] = creds;
		expect(first).toMatchObject({
			credentialId: 'urn:uuid:cred-1',
			name: 'Badge Summit',
			issuer: 'Summit',
			verified: false
		});
		// Two failing checks distilled; the successful `schema` check is not a problem.
		expect(first.problems).toEqual([
			{
				check: 'cryptographic.proof.signature',
				title: 'Invalid Signature',
				detail: undefined,
				fatal: true
			},
			{ check: 'registry.issuer', title: 'Untrusted issuer', detail: undefined, fatal: false }
		]);

		expect(second).toMatchObject({ credentialId: 'urn:uuid:cred-2', verified: true });
		// A failure with no `problems` array falls back to the check id as the title.
		expect(second.problems).toEqual([
			{ check: 'registry.issuer', title: 'registry.issuer', fatal: false }
		]);
	});

	it('falls back to matchedCredentials (verified, no problems) when credentialResults is absent', () => {
		const creds = extractVerifiedCredentials({
			variables: {
				results: {
					default: { matchedCredentials: [{ id: 'urn:uuid:m-1', name: 'Only VC' }] }
				}
			}
		});
		expect(creds).toEqual([
			{
				credentialId: 'urn:uuid:m-1',
				raw: { id: 'urn:uuid:m-1', name: 'Only VC' },
				name: 'Only VC',
				issuer: undefined,
				verified: true,
				problems: []
			}
		]);
	});

	it('returns [] when there is no results.default', () => {
		expect(extractVerifiedCredentials({})).toEqual([]);
		expect(extractVerifiedCredentials({ variables: { results: {} } })).toEqual([]);
	});
});

describe('extractPresentationProblems', () => {
	it('distills fatal VP-level problems from presentationResults', () => {
		expect(extractPresentationProblems(invalidResult())).toEqual([
			{
				check: 'cryptographic.proof.signature',
				title: 'Invalid Signature',
				detail: 'VP holder-binding proof failed',
				fatal: true
			}
		]);
	});

	it('returns [] when there are no presentation results', () => {
		expect(extractPresentationProblems({})).toEqual([]);
	});
});
