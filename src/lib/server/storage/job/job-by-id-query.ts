import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import type { JobResource } from './job-resource.js';
import { parseJobRow, rowToJobResource } from './job-row.js';

export const jobByIdQuery = defineQuery('JobById', z.object({ id: z.string() }), {
	memory: (db, { id }): JobResource | null => db.jobsById.get(id) ?? null,
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
		return rowToJobResource(parseJobRow(res.Item));
	}
});
