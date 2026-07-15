import { DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { defineQuery } from '../../core/storage/define-query.js';

import { DeleteJobParams } from './job-resource.js';

/**
 * Hard-deletes a job **and cascades** to its matches and job-apps (test-data
 * cleanup). Storage-only — the caller (route action) must authorize first.
 * Idempotent: deleting a missing job (or missing children) is a no-op.
 *
 * Child rows are found via the `GSI1PK = JOB#<id>` index (matches use a `MATCH#`
 * base-table PK, job-apps use `APP#`), matching `list-matches-by-job-query.ts`
 * and `list-job-apps-by-job-query.ts`.
 */
export const deleteJobQuery = defineQuery('DeleteJob', DeleteJobParams, {
	memory: (db, { id }): void => {
		db.jobsById.delete(id);
		for (const [matchId, match] of db.matchesById) {
			if (match.jobId === id) db.matchesById.delete(matchId);
		}
		for (const [appId, app] of db.jobAppsById) {
			if (app.jobId === id) db.jobAppsById.delete(appId);
		}
	},
	dynamo: async (ctx, { id }): Promise<void> => {
		// Collect child base-table keys from the GSI (only PK/SK are needed).
		const res = await ctx.docClient.send(
			new QueryCommand({
				TableName: ctx.tableName,
				IndexName: 'GSI1',
				KeyConditionExpression: 'GSI1PK = :p',
				ExpressionAttributeValues: { ':p': `JOB#${id}` }
			})
		);
		const childKeys: { PK: string; SK: string }[] = [];
		for (const item of res.Items ?? []) {
			if (
				typeof item.PK === 'string' &&
				(item.PK.startsWith('MATCH#') || item.PK.startsWith('APP#'))
			) {
				childKeys.push({ PK: item.PK, SK: typeof item.SK === 'string' ? item.SK : 'META' });
			}
		}

		for (const Key of childKeys) {
			await ctx.docClient.send(new DeleteCommand({ TableName: ctx.tableName, Key }));
		}

		await ctx.docClient.send(
			new DeleteCommand({ TableName: ctx.tableName, Key: { PK: `JOB#${id}`, SK: 'META' } })
		);
	}
});
