import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobRow, rowToJobResource } from './job-row.js';
import type { JobResource } from './job-resource.js';

export const listActiveJobsQuery = defineQuery('ListActiveJobs', z.object({}), {
	memory: (db): JobResource[] =>
		Array.from(db.jobsById.values()).filter((job) => job.status === 'active'),
	dynamo: async (ctx): Promise<JobResource[]> => {
		const res = await ctx.docClient.send(
			new ScanCommand({
				TableName: ctx.tableName,
				FilterExpression: 'begins_with(PK, :jobPrefix) AND SK = :sk AND #st = :active',
				ExpressionAttributeNames: { '#st': 'status' },
				ExpressionAttributeValues: {
					':jobPrefix': 'JOB#',
					':sk': 'META',
					':active': 'active'
				}
			})
		);
		const jobs: JobResource[] = [];
		for (const item of res.Items ?? []) {
			try {
				jobs.push(rowToJobResource(parseJobRow(item)));
			} catch {
				// ignore malformed rows
			}
		}
		return jobs;
	}
});
