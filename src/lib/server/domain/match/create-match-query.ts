import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { appContext } from '$lib/server/app-context.js';

import { defineQuery } from '../../core/storage/define-query.js';

import { defaultArchiveAfter } from './match-capability.js';
import { CreateMatchParams, MatchResource } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';
import { matchToRow } from './match-row.js';

/** Build a fresh match, minting the capability token + default (+30d) soft-archive date. */
function mintMatch(jobId: string): MatchResourceType {
	const { idService, timeService } = appContext();
	const createdAt = new Date(timeService.dateNowMs());
	return MatchResource({
		id: idService.secureUid(),
		createdAt,
		jobId,
		capabilityToken: idService.secureUid(),
		archiveAfter: defaultArchiveAfter(createdAt)
	});
}

export const createMatchQuery = defineQuery('CreateMatch', CreateMatchParams, {
	memory: (db, params) => {
		const match = mintMatch(params.jobId);
		db.matchesById.set(match.id, match);
		return match;
	},
	dynamo: async (ctx, params) => {
		const match = mintMatch(params.jobId);
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
