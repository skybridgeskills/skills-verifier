import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../core/define-query.js';

import { parseJobApplicationRow, rowToJobApplication } from './job-application-row.js';
import type { JobApplication } from './job-application.js';

export const jobApplicationByIdQuery = defineQuery(
	'JobApplicationById',
	z.object({ id: z.string() }),
	{
		memory: (db, { id }): JobApplication | null => db.jobApplicationsById.get(id) ?? null,
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
			return rowToJobApplication(parseJobApplicationRow(res.Item));
		}
	}
);
