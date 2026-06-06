import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

import { AppResourceFields } from '../../core/storage/app-resource.js';

export const MatchExchangeState = ZodFactory(
	z.enum(['none', 'pending', 'active', 'complete', 'invalid'])
);
export type MatchExchangeState = ReturnType<typeof MatchExchangeState>;

/** A verified credential snapshot persisted on the match. `raw` is the full OpenBadgeCredential JSON. */
export const VerifiedCredential = ZodFactory(
	z.object({
		credentialId: z.string(),
		raw: z.unknown(),
		name: z.string().optional(),
		issuer: z.string().optional()
	})
);
export type VerifiedCredential = ReturnType<typeof VerifiedCredential>;

/** Many-to-many credential->skill assignment with a per-pairing narrative. */
export const MatchAssignment = ZodFactory(
	z.object({
		skillCtid: z.string(),
		skillUrl: z.string(),
		credentialId: z.string(),
		narrative: z.string()
	})
);
export type MatchAssignment = ReturnType<typeof MatchAssignment>;

export const MatchResource = ZodFactory(
	z.object({
		// AppResource base fields
		id: AppResourceFields.id,
		createdAt: AppResourceFields.createdAt,

		// Match-specific fields
		jobId: z.string(),
		exchangeId: z.string().optional(),
		// VC-API endpoint for the active exchange, persisted so the status poll endpoint
		// reads it server-side rather than trusting client-supplied values.
		vcapi: z.string().optional(),
		exchangeState: MatchExchangeState.schema.default('none'),
		verifiedCredentials: z.array(VerifiedCredential.schema).default([]),
		assignments: z.array(MatchAssignment.schema).default([])
	})
);
export type MatchResource = ReturnType<typeof MatchResource>;

export const CreateMatchParams = z.object({ jobId: MatchResource.schema.shape.jobId });
export type CreateMatchParams = z.infer<typeof CreateMatchParams>;

export const UpdateMatchExchangeParams = z.object({
	id: z.string(),
	exchangeId: z.string(),
	vcapi: z.string().optional(),
	exchangeState: MatchExchangeState.schema,
	verifiedCredentials: z.array(VerifiedCredential.schema).optional()
});
export type UpdateMatchExchangeParams = z.infer<typeof UpdateMatchExchangeParams>;

export const SaveAssignmentsParams = z.object({
	id: z.string(),
	assignments: z.array(MatchAssignment.schema)
});
export type SaveAssignmentsParams = z.infer<typeof SaveAssignmentsParams>;
