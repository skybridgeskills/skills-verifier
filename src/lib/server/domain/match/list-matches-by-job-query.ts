import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../../core/storage/define-query.js';

import type { MatchResource } from './match-resource.js';
import { parseMatchRow, rowToMatchResource } from './match-row.js';

export const listMatchesByJobQuery = defineQuery(
	'ListMatchesByJob',
	z.object({ jobId: z.string() }),
	{
		memory: (db, { jobId }): MatchResource[] =>
			Array.from(db.matchesById.values())
				.filter((match) => match.jobId === jobId)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
		dynamo: async (ctx, { jobId }): Promise<MatchResource[]> => {
			const res = await ctx.docClient.send(
				new QueryCommand({
					TableName: ctx.tableName,
					IndexName: 'GSI1',
					KeyConditionExpression: 'GSI1PK = :p',
					ExpressionAttributeValues: {
						':p': `JOB#${jobId}`
					},
					ScanIndexForward: false
				})
			);
			const out: MatchResource[] = [];
			for (const item of res.Items ?? []) {
				try {
					// Only match rows use MATCH# PK prefix on base table; GSI projects full item
					if (typeof item.PK === 'string' && item.PK.startsWith('MATCH#')) {
						out.push(rowToMatchResource(parseMatchRow(item)));
					}
				} catch {
					// skip bad rows
				}
			}
			return out;
		}
	}
);
