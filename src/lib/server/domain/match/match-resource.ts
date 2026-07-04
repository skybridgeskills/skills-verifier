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
		assignments: z.array(MatchAssignment.schema).default([]),

		// Secret capability token (128-bit base-62 `secureUid`) that unlocks edit + delete via a
		// `?edit=<token>` query param. Empty on legacy matches minted before capability tokens
		// existed → those are effectively read-only (no token ever equals '', see verifyMatchCapability).
		capabilityToken: z.string().default(''),
		// Soft-archive date: after this passes the share/edit URLs return 410 and the record is
		// hidden but retained. Set to `createdAt + 30d` at creation; extendable to 90d on edit.
		archiveAfter: z.date()
	})
);
export type MatchResource = ReturnType<typeof MatchResource>;

export const CreateMatchParams = z.object({ jobId: MatchResource.schema.shape.jobId });
export type CreateMatchParams = z.infer<typeof CreateMatchParams>;

/** Expiry presets the UI offers ("keep this match for N days"); the server clamps to <= 90. */
export const ExpiryDays = z.union([z.literal(30), z.literal(60), z.literal(90)]);
export type ExpiryDays = z.infer<typeof ExpiryDays>;

/** Capability-authorized update: change assignments and/or extend the expiry. */
export const UpdateMatchParams = z.object({
	id: z.string(),
	assignments: z.array(MatchAssignment.schema).optional(),
	expiryDays: ExpiryDays.optional()
});
export type UpdateMatchParams = z.infer<typeof UpdateMatchParams>;

/** Capability-authorized hard delete. */
export const DeleteMatchParams = z.object({ id: z.string() });
export type DeleteMatchParams = z.infer<typeof DeleteMatchParams>;

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
