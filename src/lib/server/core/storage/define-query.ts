import type { z } from 'zod';

import { appContext } from '$lib/server/app-context.js';

import type { MemoryDatabase } from './memory-database.js';
import type { DynamoStorageDatabase } from './types.js';
import { isDynamoDatabase, isMemoryDatabase } from './types.js';

/**
 * Named query with colocated memory and DynamoDB implementations (hexagonal storage).
 * Always returns a Promise so call sites work the same for memory and DynamoDB.
 */
export function defineQuery<TQueryName extends string, TParams extends z.ZodType, TResult>(
	queryName: TQueryName,
	paramSchema: TParams,
	impl: {
		memory: (db: MemoryDatabase, params: z.infer<TParams>) => TResult;
		dynamo: (ctx: DynamoStorageDatabase, params: z.infer<TParams>) => Promise<TResult>;
	}
): (paramsIn: z.input<TParams>) => Promise<TResult> {
	return async (paramsIn: z.input<TParams>) => {
		const params = paramSchema.parse(paramsIn);
		const { database } = appContext();
		if (isMemoryDatabase(database)) {
			return impl.memory(database, params);
		}
		if (isDynamoDatabase(database)) {
			return impl.dynamo(database, params);
		}
		throw new Error(`${queryName}: unknown database type`);
	};
}
