import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../../core/storage/define-query.js';

import { extendedArchiveAfter } from './match-capability.js';
import { MatchResource, UpdateMatchParams } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';
import { matchToRow, parseMatchRow, rowToMatchResource } from './match-row.js';

/**
 * Capability-authorized update: replace `assignments` and/or extend the soft-archive
 * expiry (`archiveAfter = now + expiryDays`, clamped to <= 90 days). Storage-only —
 * the caller (route action) must authorize with `verifyMatchCapability` first.
 */
function applyUpdate(existing: MatchResourceType, params: UpdateMatchParams): MatchResourceType {
	const { timeService } = appContext();
	return MatchResource({
		...existing,
		...(params.assignments !== undefined ? { assignments: params.assignments } : {}),
		...(params.expiryDays !== undefined
			? { archiveAfter: extendedArchiveAfter(new Date(timeService.dateNowMs()), params.expiryDays) }
			: {})
	});
}

export const updateMatchQuery = defineQuery('UpdateMatch', UpdateMatchParams, {
	memory: (db, params): MatchResourceType => {
		const existing = db.matchesById.get(params.id);
		if (!existing) throw new Error(`UpdateMatch: match not found: ${params.id}`);
		const updated = applyUpdate(existing, params);
		db.matchesById.set(updated.id, updated);
		return updated;
	},
	dynamo: async (ctx, params): Promise<MatchResourceType> => {
		const res = await ctx.docClient.send(
			new GetCommand({
				TableName: ctx.tableName,
				Key: { PK: `MATCH#${params.id}`, SK: 'META' }
			})
		);
		if (!res.Item) throw new Error(`UpdateMatch: match not found: ${params.id}`);
		const updated = applyUpdate(rowToMatchResource(parseMatchRow(res.Item)), params);
		await ctx.docClient.send(
			new PutCommand({ TableName: ctx.tableName, Item: matchToRow(updated) })
		);
		return updated;
	}
});
