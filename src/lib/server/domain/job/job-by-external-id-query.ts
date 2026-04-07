import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import type { JobResource } from './job-resource.js';
import { parseJobRow, rowToJobResource } from './job-row.js';

export const jobByExternalIdQuery = defineQuery(
	'JobByExternalId',
	z.object({ externalId: z.string() }),
	{
		memory: (db, { externalId }): JobResource | null => {
			for (const job of db.jobsById.values()) {
				if (job.externalId === externalId) {
					return job;
				}
			}
			return null;
		},
		dynamo: async (ctx, { externalId }) => {
			const res = await ctx.docClient.send(
				new QueryCommand({
					TableName: ctx.tableName,
					IndexName: 'GSI1',
					KeyConditionExpression: 'GSI1PK = :p AND GSI1SK = :s',
					ExpressionAttributeValues: {
						':p': `EXTERNAL#${externalId}`,
						':s': 'META'
					},
					Limit: 1
				})
			);
			const item = res.Items?.[0];
			if (!item) {
				return null;
			}
			return rowToJobResource(parseJobRow(item));
		}
	}
);
