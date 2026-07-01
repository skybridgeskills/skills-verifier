import type {
	ExchangeStatus,
	VerificationExchange,
	VerifiedCredentialResult
} from './verification-exchange.js';

/** Default number of polls before the fake exchange reports `complete`. */
export const FAKE_COMPLETE_AFTER_POLLS = 2;

const FAKE_HOST = 'https://fake-dcc.test';

/**
 * Fixture OpenBadgeCredentials returned by the fake exchange once complete. Realistic
 * enough to render: each has `id`, `name`, `issuer.name`, and a `credentialSubject`.
 */
export const FAKE_VERIFIED_CREDENTIALS: VerifiedCredentialResult[] = [
	{
		credentialId: 'urn:uuid:fake-credential-1',
		name: 'Patient Care Fundamentals',
		issuer: 'Riverside Community College',
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
 * In-memory fake verify exchange. `createVerifyExchange` mints an exchange and canned
 * interaction protocols; `getExchangeStatus` reports non-complete on the first poll(s) and
 * `complete` with fixture credentials on/after `completeAfterPolls`.
 */
export function FakeVerificationExchange(
	completeAfterPolls: number = FAKE_COMPLETE_AFTER_POLLS
): VerificationExchange {
	const state = new Map<string, { polls: number }>();
	let counter = 0;

	return {
		async createVerifyExchange() {
			const id = `fake-exchange-${++counter}`;
			state.set(id, { polls: 0 });
			return {
				exchangeId: id,
				protocols: {
					iu: `${FAKE_HOST}/interactions/${id}`,
					vcapi: `${FAKE_HOST}/workflows/verify/exchanges/${id}`,
					lcw: `${FAKE_HOST}/lcw/${id}`,
					verifiablePresentationRequest: {}
				}
			};
		},

		async getExchangeStatus({ exchangeId }): Promise<ExchangeStatus> {
			const entry = state.get(exchangeId) ?? { polls: 0 };
			entry.polls += 1;
			state.set(exchangeId, entry);

			if (entry.polls >= completeAfterPolls) {
				return {
					state: 'complete',
					verifiedCredentials: FAKE_VERIFIED_CREDENTIALS.map((c) => ({ ...c }))
				};
			}

			return { state: entry.polls === 1 ? 'pending' : 'active', verifiedCredentials: [] };
		}
	};
}
