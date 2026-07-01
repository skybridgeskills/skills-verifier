import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { defineQuery } from '../../core/storage/define-query.js';

import type { MatchResource } from './match-resource.js';
import { parseMatchRow, rowToMatchResource } from './match-row.js';

export const matchByIdQuery = defineQuery('MatchById', z.object({ id: z.string() }), {
	memory: (db, { id }): MatchResource | null => db.matchesById.get(id) ?? null,
	dynamo: async (ctx, { id }) => {
		const res = await ctx.docClient.send(
			new GetCommand({
				TableName: ctx.tableName,
				Key: { PK: `MATCH#${id}`, SK: 'META' }
			})
		);
		if (!res.Item) {
			return null;
		}
		return rowToMatchResource(parseMatchRow(res.Item));
	}
});
