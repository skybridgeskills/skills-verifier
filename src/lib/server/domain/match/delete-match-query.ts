import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { defineQuery } from '../../core/storage/define-query.js';

import { DeleteMatchParams } from './match-resource.js';

/**
 * Capability-authorized **hard delete** of a match (removes the record, including its
 * verified-credential snapshot). Storage-only — the caller (route action) must
 * authorize with `verifyMatchCapability` first. Idempotent: deleting a missing match
 * is a no-op.
 */
export const deleteMatchQuery = defineQuery('DeleteMatch', DeleteMatchParams, {
	memory: (db, params): void => {
		db.matchesById.delete(params.id);
	},
	dynamo: async (ctx, params): Promise<void> => {
		await ctx.docClient.send(
			new DeleteCommand({
				TableName: ctx.tableName,
				Key: { PK: `MATCH#${params.id}`, SK: 'META' }
			})
		);
	}
});
