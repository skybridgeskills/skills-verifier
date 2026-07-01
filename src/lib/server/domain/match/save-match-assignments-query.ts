import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { defineQuery } from '../../core/storage/define-query.js';

import { MatchResource, SaveAssignmentsParams } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';
import { matchToRow, parseMatchRow, rowToMatchResource } from './match-row.js';

export const saveMatchAssignmentsQuery = defineQuery(
	'SaveMatchAssignments',
	SaveAssignmentsParams,
	{
		memory: (db, params): MatchResourceType => {
			const existing = db.matchesById.get(params.id);
			if (!existing) {
				throw new Error(`SaveMatchAssignments: match not found: ${params.id}`);
			}
			const updated: MatchResourceType = MatchResource({
				...existing,
				assignments: params.assignments
			});
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
			if (!res.Item) {
				throw new Error(`SaveMatchAssignments: match not found: ${params.id}`);
			}
			const existing = rowToMatchResource(parseMatchRow(res.Item));
			const updated: MatchResourceType = MatchResource({
				...existing,
				assignments: params.assignments
			});
			await ctx.docClient.send(
				new PutCommand({
					TableName: ctx.tableName,
					Item: matchToRow(updated)
				})
			);
			return updated;
		}
	}
);
