import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../core/define-query.js';

import { JobApplicationStatusSchema, jobApplicationToRow } from './job-application-row.js';
import type { JobApplication } from './job-application.js';

export const CreateJobApplicationParamsSchema = z.object({
	jobId: z.string(),
	candidateName: z.string(),
	candidateEmail: z.string(),
	resumeUrl: z.string().optional(),
	status: JobApplicationStatusSchema.default('pending')
});

export const createJobApplicationQuery = defineQuery(
	'CreateJobApplication',
	CreateJobApplicationParamsSchema,
	{
		memory: (db, params) => {
			const { idService, timeService } = appContext();
			const id = idService.secureUid();
			const createdAt = new Date(timeService.dateNowMs());
			const application: JobApplication = {
				id,
				createdAt,
				jobId: params.jobId,
				candidateName: params.candidateName,
				candidateEmail: params.candidateEmail,
				resumeUrl: params.resumeUrl,
				status: params.status
			};
			db.jobApplicationsById.set(id, application);
			return application;
		},
		dynamo: async (ctx, params) => {
			const { idService, timeService } = appContext();
			const id = idService.secureUid();
			const createdAt = new Date(timeService.dateNowMs());
			const application: JobApplication = {
				id,
				createdAt,
				jobId: params.jobId,
				candidateName: params.candidateName,
				candidateEmail: params.candidateEmail,
				resumeUrl: params.resumeUrl,
				status: params.status
			};
			await ctx.docClient.send(
				new PutCommand({
					TableName: ctx.tableName,
					Item: jobApplicationToRow(application),
					ConditionExpression: 'attribute_not_exists(PK)'
				})
			);
			return application;
		}
	}
);
