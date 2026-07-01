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
	createdAt: z.string()
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
		createdAt: iso
	};
}

export function rowToMatchResource(row: MatchRow): MatchResourceType {
	return MatchResource({
		id: row.id,
		jobId: row.jobId,
		exchangeId: row.exchangeId,
		vcapi: row.vcapi,
		exchangeState: row.exchangeState,
		verifiedCredentials: row.verifiedCredentials,
		assignments: row.assignments,
		createdAt: new Date(row.createdAt)
	});
}

export function parseMatchRow(raw: unknown): MatchRow {
	return MatchRow.parse(raw);
}
