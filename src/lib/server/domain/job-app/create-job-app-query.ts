import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../core/define-query.js';

import { CreateJobAppParams, JobAppResource } from './job-app-resource.js';
import type { JobAppResource as JobAppResourceType } from './job-app-resource.js';
import { jobAppToRow } from './job-app-row.js';

export const createJobAppQuery = defineQuery('CreateJobApp', CreateJobAppParams, {
	memory: (db, params) => {
		const { idService, timeService } = appContext();
		const app: JobAppResourceType = JobAppResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			jobId: params.jobId,
			candidateName: params.candidateName,
			candidateEmail: params.candidateEmail,
			resumeUrl: params.resumeUrl,
			status: params.status
		});
		db.jobAppsById.set(app.id, app);
		return app;
	},
	dynamo: async (ctx, params) => {
		const { idService, timeService } = appContext();
		const app: JobAppResourceType = JobAppResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			jobId: params.jobId,
			candidateName: params.candidateName,
			candidateEmail: params.candidateEmail,
			resumeUrl: params.resumeUrl,
			status: params.status
		});
		await ctx.docClient.send(
			new PutCommand({
				TableName: ctx.tableName,
				Item: jobAppToRow(app),
				ConditionExpression: 'attribute_not_exists(PK)'
			})
		);
		return app;
	}
});
