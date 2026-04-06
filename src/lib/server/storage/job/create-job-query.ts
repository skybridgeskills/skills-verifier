import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../core/define-query.js';

import { FrameworkSchema, JobStatus, SkillSchema, jobToRow } from './job-row.js';
import type { Job } from './job.js';

export const CreateJobParamsSchema = z.object({
	externalId: z.string(),
	externalUrl: z.string().optional(),
	name: z.string(),
	description: z.string(),
	company: z.string(),
	frameworks: z.array(FrameworkSchema),
	skills: z.array(SkillSchema),
	status: JobStatus.default('draft')
});

export const createJobQuery = defineQuery('CreateJob', CreateJobParamsSchema, {
	memory: (db, params) => {
		const { idService, timeService } = appContext();
		const id = idService.secureUid();
		const createdAt = new Date(timeService.dateNowMs());
		const job: Job = {
			id,
			createdAt,
			externalId: params.externalId,
			externalUrl: params.externalUrl,
			name: params.name,
			description: params.description,
			company: params.company,
			frameworks: params.frameworks,
			skills: params.skills,
			status: params.status
		};
		db.jobsById.set(id, job);
		return job;
	},
	dynamo: async (ctx, params) => {
		const { idService, timeService } = appContext();
		const id = idService.secureUid();
		const createdAt = new Date(timeService.dateNowMs());
		const job: Job = {
			id,
			createdAt,
			externalId: params.externalId,
			externalUrl: params.externalUrl,
			name: params.name,
			description: params.description,
			company: params.company,
			frameworks: params.frameworks,
			skills: params.skills,
			status: params.status
		};
		await ctx.docClient.send(
			new PutCommand({
				TableName: ctx.tableName,
				Item: jobToRow(job),
				ConditionExpression: 'attribute_not_exists(PK)'
			})
		);
		return job;
	}
});
