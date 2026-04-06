import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobRow, rowToJob } from './job-row.js';
import type { Job } from './job.js';

export const listActiveJobsQuery = defineQuery('ListActiveJobs', z.object({}), {
	memory: (db): Job[] => Array.from(db.jobsById.values()).filter((job) => job.status === 'active'),
	dynamo: async (ctx): Promise<Job[]> => {
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
		const jobs: Job[] = [];
		for (const item of res.Items ?? []) {
			try {
				jobs.push(rowToJob(parseJobRow(item)));
			} catch {
				// ignore malformed rows
			}
		}
		return jobs;
	}
});
