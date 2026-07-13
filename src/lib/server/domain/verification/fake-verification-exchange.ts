import type {
	ExchangePresentationChallenge,
	ExchangeStatus,
	VerificationExchange,
	VerificationProblem,
	VerifiedCredentialResult
} from './verification-exchange.js';

/** Default number of polls before the fake exchange reports `complete`. */
export const FAKE_COMPLETE_AFTER_POLLS = 2;

const FAKE_HOST = 'https://fake-dcc.test';

/** Which terminal outcome the fake exchange reports (drives P3 warning/invalid stories/tests). */
export type FakeOutcome = 'complete' | 'invalid';

/** Options for the fake exchange (all optional; defaults preserve the happy path). */
export interface FakeVerificationExchangeOptions {
	/** Terminal outcome once `completeAfterPolls` is reached. Defaults to `complete`. */
	outcome?: FakeOutcome;
}

/** Derive the fake exchange id from a `vcapi` URL (its last path segment). */
function exchangeIdFromVcapi(vcapi: string): string {
	try {
		return new URL(vcapi).pathname.split('/').filter(Boolean).pop() ?? '';
	} catch {
		return '';
	}
}

/**
 * Fixture OpenBadgeCredentials returned by the fake exchange once complete. Realistic
 * enough to render: each has `id`, `name`, `issuer.name`, and a `credentialSubject`.
 */
export const FAKE_VERIFIED_CREDENTIALS: VerifiedCredentialResult[] = [
	{
		credentialId: 'urn:uuid:fake-credential-1',
		name: 'Patient Care Fundamentals',
		issuer: 'Riverside Community College',
		verified: true,
		problems: [],
		raw: {
			'@context': ['https://www.w3.org/ns/credentials/v2'],
			id: 'urn:uuid:fake-credential-1',
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			name: 'Patient Care Fundamentals',
			issuer: { id: 'did:web:riverside.example', name: 'Riverside Community College' },
			credentialSubject: {
				id: 'did:example:learner-1',
				type: ['AchievementSubject'],
				achievement: {
					id: 'urn:uuid:fake-achievement-1',
					type: ['Achievement'],
					name: 'Patient Care Fundamentals',
					description: 'Demonstrated competency in foundational patient care.'
				}
			}
		}
	},
	{
		credentialId: 'urn:uuid:fake-credential-2',
		name: 'Medication Administration',
		issuer: 'Lakeshore Health Institute',
		verified: true,
		problems: [],
		raw: {
			'@context': ['https://www.w3.org/ns/credentials/v2'],
			id: 'urn:uuid:fake-credential-2',
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			name: 'Medication Administration',
			issuer: { id: 'did:web:lakeshore.example', name: 'Lakeshore Health Institute' },
			credentialSubject: {
				id: 'did:example:learner-1',
				type: ['AchievementSubject'],
				achievement: {
					id: 'urn:uuid:fake-achievement-2',
					type: ['Achievement'],
					name: 'Medication Administration',
					description: 'Demonstrated safe medication administration practices.'
				}
			}
		}
	}
];

/**
 * Invalid-path fixtures: one credential with a fatal (critical) signature failure
 * (`verified: false`) and one that verifies but carries a non-fatal issuer-registry
 * warning (`verified: true`). Drives the forgiving board's warning/invalid states.
 */
export const FAKE_INVALID_VERIFIED_CREDENTIALS: VerifiedCredentialResult[] = [
	{
		credentialId: 'urn:uuid:fake-credential-1',
		name: 'Patient Care Fundamentals',
		issuer: 'Riverside Community College',
		verified: false,
		problems: [
			{
				check: 'cryptographic.proof.signature',
				title: 'Invalid Signature',
				detail: 'The credential proof could not be cryptographically verified.',
				fatal: true
			}
		],
		raw: {
			'@context': ['https://www.w3.org/ns/credentials/v2'],
			id: 'urn:uuid:fake-credential-1',
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			name: 'Patient Care Fundamentals',
			issuer: { id: 'did:web:riverside.example', name: 'Riverside Community College' },
			credentialSubject: {
				id: 'did:example:learner-1',
				type: ['AchievementSubject'],
				achievement: {
					id: 'urn:uuid:fake-achievement-1',
					type: ['Achievement'],
					name: 'Patient Care Fundamentals',
					description: 'Demonstrated competency in foundational patient care.'
				}
			}
		}
	},
	{
		credentialId: 'urn:uuid:fake-credential-2',
		name: 'Medication Administration',
		issuer: 'Lakeshore Health Institute',
		verified: true,
		problems: [
			{
				check: 'registry.issuer',
				title: 'Issuer not in a trusted registry',
				detail: 'The issuer could not be found in a known trust registry.',
				fatal: false
			}
		],
		raw: {
			'@context': ['https://www.w3.org/ns/credentials/v2'],
			id: 'urn:uuid:fake-credential-2',
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			name: 'Medication Administration',
			issuer: { id: 'did:web:lakeshore.example', name: 'Lakeshore Health Institute' },
			credentialSubject: {
				id: 'did:example:learner-1',
				type: ['AchievementSubject'],
				achievement: {
					id: 'urn:uuid:fake-achievement-2',
					type: ['Achievement'],
					name: 'Medication Administration',
					description: 'Demonstrated safe medication administration practices.'
				}
			}
		}
	}
];

/** Presentation-level (VP holder-binding) problem for the invalid path. */
export const FAKE_PRESENTATION_PROBLEMS: VerificationProblem[] = [
	{
		check: 'cryptographic.proof.signature',
		title: 'Presentation signature could not be verified',
		detail: 'The holder-binding proof on the presentation failed to verify.',
		fatal: true
	}
];

/** Clone the fixture list for the requested outcome so callers never share references. */
function credentialsFor(outcome: FakeOutcome): VerifiedCredentialResult[] {
	const source =
		outcome === 'invalid' ? FAKE_INVALID_VERIFIED_CREDENTIALS : FAKE_VERIFIED_CREDENTIALS;
	return source.map((c) => ({ ...c, problems: c.problems.map((p) => ({ ...p })) }));
}

/** The terminal `ExchangeStatus` the fake reports for the configured outcome. */
function terminalStatus(outcome: FakeOutcome): ExchangeStatus {
	return {
		state: outcome,
		verifiedCredentials: credentialsFor(outcome),
		presentationProblems:
			outcome === 'invalid' ? FAKE_PRESENTATION_PROBLEMS.map((p) => ({ ...p })) : []
	};
}

/**
 * In-memory fake verify exchange. `createVerifyExchange` mints an exchange and canned
 * interaction protocols; `getExchangeStatus` reports non-complete on the first poll(s) and
 * the terminal outcome (`complete` by default, `invalid` when configured) with fixture
 * credentials on/after `completeAfterPolls`.
 */
export function FakeVerificationExchange(
	completeAfterPolls: number = FAKE_COMPLETE_AFTER_POLLS,
	options: FakeVerificationExchangeOptions = {}
): VerificationExchange {
	const outcome: FakeOutcome = options.outcome ?? 'complete';
	const state = new Map<string, { polls: number; challenge: string; domain: string }>();
	let counter = 0;

	return {
		async createVerifyExchange() {
			const id = `fake-exchange-${++counter}`;
			const vcapi = `${FAKE_HOST}/workflows/verify/exchanges/${id}`;
			const challenge = `fake-challenge-${id}`;
			state.set(id, { polls: 0, challenge, domain: vcapi });
			return {
				exchangeId: id,
				protocols: {
					iu: `${FAKE_HOST}/interactions/${id}`,
					vcapi,
					lcw: `${FAKE_HOST}/lcw/${id}`,
					verifiablePresentationRequest: { challenge, domain: vcapi }
				}
			};
		},

		async getExchangeStatus({ exchangeId }): Promise<ExchangeStatus> {
			const entry = state.get(exchangeId) ?? { polls: 0, challenge: '', domain: '' };
			entry.polls += 1;
			state.set(exchangeId, entry);

			if (entry.polls >= completeAfterPolls) {
				return terminalStatus(outcome);
			}

			return {
				state: entry.polls === 1 ? 'pending' : 'active',
				verifiedCredentials: [],
				presentationProblems: []
			};
		},

		async fetchExchangeVpr({ vcapi }): Promise<ExchangePresentationChallenge> {
			const entry = state.get(exchangeIdFromVcapi(vcapi));
			// Fall back to a vcapi-derived challenge so the fake is usable even for unknown ids.
			return {
				challenge: entry?.challenge ?? `fake-challenge-${exchangeIdFromVcapi(vcapi)}`,
				domain: entry?.domain ?? vcapi
			};
		},

		async submitPresentation(): Promise<ExchangeStatus> {
			// The fake stands in for transaction-service verification: it reports the configured outcome.
			return terminalStatus(outcome);
		}
	};
}
