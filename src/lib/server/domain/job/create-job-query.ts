import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../../core/storage/define-query.js';

import { CreateJobParams, JobResource } from './job-resource.js';
import type { JobResource as JobResourceType } from './job-resource.js';
import { jobToRow } from './job-row.js';

export const createJobQuery = defineQuery('CreateJob', CreateJobParams, {
	memory: (db, params) => {
		const { idService, timeService } = appContext();
		const job: JobResourceType = JobResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			externalId: params.externalId,
			externalUrl: params.externalUrl,
			name: params.name,
			description: params.description,
			company: params.company,
			frameworks: params.frameworks,
			skills: params.skills,
			status: params.status
		});
		db.jobsById.set(job.id, job);
		return job;
	},
	dynamo: async (ctx, params) => {
		const { idService, timeService } = appContext();
		const job: JobResourceType = JobResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			externalId: params.externalId,
			externalUrl: params.externalUrl,
			name: params.name,
			description: params.description,
			company: params.company,
			frameworks: params.frameworks,
			skills: params.skills,
			status: params.status
		});
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
