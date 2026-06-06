import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../../core/storage/define-query.js';

import { CreateMatchParams, MatchResource } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';
import { matchToRow } from './match-row.js';

export const createMatchQuery = defineQuery('CreateMatch', CreateMatchParams, {
	memory: (db, params) => {
		const { idService, timeService } = appContext();
		const match: MatchResourceType = MatchResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			jobId: params.jobId
		});
		db.matchesById.set(match.id, match);
		return match;
	},
	dynamo: async (ctx, params) => {
		const { idService, timeService } = appContext();
		const match: MatchResourceType = MatchResource({
			id: idService.secureUid(),
			createdAt: new Date(timeService.dateNowMs()),
			jobId: params.jobId
		});
		await ctx.docClient.send(
			new PutCommand({
				TableName: ctx.tableName,
				Item: matchToRow(match),
				ConditionExpression: 'attribute_not_exists(PK)'
			})
		);
		return match;
	}
});
