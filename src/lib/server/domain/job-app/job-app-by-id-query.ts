import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../../core/storage/define-query.js';

import type { JobAppResource } from './job-app-resource.js';
import { parseJobAppRow, rowToJobAppResource } from './job-app-row.js';

export const jobAppByIdQuery = defineQuery('JobAppById', z.object({ id: z.string() }), {
	memory: (db, { id }): JobAppResource | null => db.jobAppsById.get(id) ?? null,
	dynamo: async (ctx, { id }) => {
		const res = await ctx.docClient.send(
			new GetCommand({
				TableName: ctx.tableName,
				Key: { PK: `APP#${id}`, SK: 'META' }
			})
		);
		if (!res.Item) {
			return null;
		}
		return rowToJobAppResource(parseJobAppRow(res.Item));
	}
});
