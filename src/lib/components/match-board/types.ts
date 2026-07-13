import type {
	MatchAssignment,
	VerificationProblem,
	VerifiedCredential
} from '$lib/server/domain/match/match-resource.js';

import type { BadgeDetail } from './badge-detail.js';

/**
 * Client-facing mirror of the server {@link MatchAssignment} shape (pure-zod, type-only import is
 * safe). Kept as a distinct name so the board can hold draft assignments in `$state` before they are
 * persisted via the `saveAssignments` action.
 */
export type ClientAssignment = Pick<
	MatchAssignment,
	'skillCtid' | 'skillUrl' | 'credentialId' | 'narrative'
>;

/** Client-facing view of a verified credential rendered as a draggable card. */
export type ClientCredential = Pick<
	VerifiedCredential,
	'credentialId' | 'name' | 'issuer' | 'verified' | 'problems'
> & {
	/** Rich badge metadata (dates, description, image, issuer) parsed from the raw credential. */
	detail?: BadgeDetail;
};

export type { BadgeDetail, VerificationProblem };
