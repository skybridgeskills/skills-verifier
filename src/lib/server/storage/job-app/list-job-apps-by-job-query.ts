import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobAppRow, rowToJobAppResource } from './job-app-row.js';
import type { JobAppResource } from './job-app-resource.js';

export const listJobAppsByJobQuery = defineQuery(
	'ListJobAppsByJob',
	z.object({ jobId: z.string() }),
	{
		memory: (db, { jobId }): JobAppResource[] =>
			Array.from(db.jobAppsById.values())
				.filter((app) => app.jobId === jobId)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
		dynamo: async (ctx, { jobId }): Promise<JobAppResource[]> => {
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
			const out: JobAppResource[] = [];
			for (const item of res.Items ?? []) {
				try {
					// Only application rows use APP# PK prefix on base table; GSI projects full item
					if (typeof item.PK === 'string' && item.PK.startsWith('APP#')) {
						out.push(rowToJobAppResource(parseJobAppRow(item)));
					}
				} catch {
					// skip bad rows
				}
			}
			return out;
		}
	}
);
