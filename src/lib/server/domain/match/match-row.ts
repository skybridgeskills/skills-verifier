import { z } from 'zod';

import { AppRowFields } from '../../core/storage/app-row.js';

import { MatchExchangeState, MatchResource } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';

/**
 * DynamoDB item shape for a match (single-table design).
 * Extends AppRow with domain-specific fields.
 */
export const MatchRow = z.object({
	// AppRow base fields
	PK: AppRowFields.PK,
	SK: AppRowFields.SK,
	GSI1PK: AppRowFields.GSI1PK,
	GSI1SK: AppRowFields.GSI1SK,

	// Domain fields (referenced from source schema for consistency)
	id: MatchResource.schema.shape.id,
	jobId: MatchResource.schema.shape.jobId,
	exchangeId: MatchResource.schema.shape.exchangeId,
	vcapi: MatchResource.schema.shape.vcapi,
	exchangeState: MatchExchangeState.schema,
	verifiedCredentials: MatchResource.schema.shape.verifiedCredentials,
	assignments: MatchResource.schema.shape.assignments,
	createdAt: z.string(),
	// Back-compat: legacy rows predate these. `capabilityToken` defaults to '' (read-only);
	// `archiveAfter` is optional here and defaulted to createdAt + 30d on read.
	capabilityToken: z.string().default(''),
	archiveAfter: z.string().optional()
});

export type MatchRow = z.infer<typeof MatchRow>;

export function matchMetaKeys(
	id: string,
	jobId: string,
	createdAtIso: string
): Pick<MatchRow, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'> {
	return {
		PK: `MATCH#${id}`,
		SK: 'META',
		GSI1PK: `JOB#${jobId}`,
		GSI1SK: `MATCH#${createdAtIso}#${id}`
	};
}

export function matchToRow(match: MatchResourceType): MatchRow {
	const iso = match.createdAt.toISOString();
	return {
		...matchMetaKeys(match.id, match.jobId, iso),
		id: match.id,
		jobId: match.jobId,
		exchangeId: match.exchangeId,
		vcapi: match.vcapi,
		exchangeState: match.exchangeState,
		verifiedCredentials: match.verifiedCredentials,
		assignments: match.assignments,
		createdAt: iso,
		capabilityToken: match.capabilityToken,
		archiveAfter: match.archiveAfter.toISOString()
	};
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function rowToMatchResource(row: MatchRow): MatchResourceType {
	return MatchResource({
		id: row.id,
		jobId: row.jobId,
		exchangeId: row.exchangeId,
		vcapi: row.vcapi,
		exchangeState: row.exchangeState,
		verifiedCredentials: row.verifiedCredentials,
		assignments: row.assignments,
		createdAt: new Date(row.createdAt),
		capabilityToken: row.capabilityToken ?? '',
		// Legacy rows without an archiveAfter default to createdAt + 30d.
		archiveAfter: row.archiveAfter
			? new Date(row.archiveAfter)
			: new Date(new Date(row.createdAt).getTime() + 30 * DAY_MS)
	});
}

export function parseMatchRow(raw: unknown): MatchRow {
	return MatchRow.parse(raw);
}
