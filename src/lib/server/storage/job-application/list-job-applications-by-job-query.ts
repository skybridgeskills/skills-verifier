import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobApplicationRow, rowToJobApplication } from './job-application-row.js';
import type { JobApplication } from './job-application.js';

export const listJobApplicationsByJobQuery = defineQuery(
	'ListJobApplicationsByJob',
	z.object({ jobId: z.string() }),
	{
		memory: (db, { jobId }): JobApplication[] =>
			Array.from(db.jobApplicationsById.values())
				.filter((app) => app.jobId === jobId)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
		dynamo: async (ctx, { jobId }): Promise<JobApplication[]> => {
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
			const out: JobApplication[] = [];
			for (const item of res.Items ?? []) {
				try {
					// Only application rows use APP# PK prefix on base table; GSI projects full item
					if (typeof item.PK === 'string' && item.PK.startsWith('APP#')) {
						out.push(rowToJobApplication(parseJobApplicationRow(item)));
					}
				} catch {
					// skip bad rows
				}
			}
			return out;
		}
	}
);
