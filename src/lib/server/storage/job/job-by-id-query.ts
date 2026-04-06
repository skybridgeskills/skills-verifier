import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobRow, rowToJob } from './job-row.js';
import type { Job } from './job.js';

export const jobByIdQuery = defineQuery('JobById', z.object({ id: z.string() }), {
	memory: (db, { id }): Job | null => db.jobsById.get(id) ?? null,
	dynamo: async (ctx, { id }) => {
		const res = await ctx.docClient.send(
			new GetCommand({
				TableName: ctx.tableName,
				Key: { PK: `JOB#${id}`, SK: 'META' }
			})
		);
		if (!res.Item) {
			return null;
		}
		return rowToJob(parseJobRow(res.Item));
	}
});
