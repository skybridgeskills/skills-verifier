import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { defineQuery } from '../../core/storage/define-query.js';

import { MatchResource, UpdateMatchExchangeParams } from './match-resource.js';
import type { MatchResource as MatchResourceType } from './match-resource.js';
import { matchToRow, parseMatchRow, rowToMatchResource } from './match-row.js';

export const saveMatchCredentialsQuery = defineQuery(
	'SaveMatchCredentials',
	UpdateMatchExchangeParams,
	{
		memory: (db, params): MatchResourceType => {
			const existing = db.matchesById.get(params.id);
			if (!existing) {
				throw new Error(`SaveMatchCredentials: match not found: ${params.id}`);
			}
			const updated: MatchResourceType = MatchResource({
				...existing,
				exchangeId: params.exchangeId,
				vcapi: params.vcapi ?? existing.vcapi,
				exchangeState: params.exchangeState,
				verifiedCredentials: params.verifiedCredentials ?? existing.verifiedCredentials
			});
			db.matchesById.set(updated.id, updated);
			return updated;
		},
		dynamo: async (ctx, params): Promise<MatchResourceType> => {
			const res = await ctx.docClient.send(
				new GetCommand({
					TableName: ctx.tableName,
					Key: { PK: `MATCH#${params.id}`, SK: 'META' }
				})
			);
			if (!res.Item) {
				throw new Error(`SaveMatchCredentials: match not found: ${params.id}`);
			}
			const existing = rowToMatchResource(parseMatchRow(res.Item));
			const updated: MatchResourceType = MatchResource({
				...existing,
				exchangeId: params.exchangeId,
				vcapi: params.vcapi ?? existing.vcapi,
				exchangeState: params.exchangeState,
				verifiedCredentials: params.verifiedCredentials ?? existing.verifiedCredentials
			});
			await ctx.docClient.send(
				new PutCommand({
					TableName: ctx.tableName,
					Item: matchToRow(updated)
				})
			);
			return updated;
		}
	}
);
