import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { createDynamoDbClient } from './dynamo-client.js';
import { MemoryDatabase } from './memory-database.js';
import type { StorageDatabase } from './types.js';

/**
 * Builds storage: memory when forced or when no table is configured; otherwise DynamoDB.
 */
export function createStorageDatabase(): StorageDatabase {
	const useMemory =
		process.env.USE_MEMORY_STORAGE === 'true' || process.env.USE_MEMORY_STORAGE === '1';

	if (useMemory) {
		return new MemoryDatabase();
	}

	const tableName = process.env.DYNAMODB_TABLE?.trim();
	if (tableName) {
		return {
			$type: 'dynamo',
			docClient: DynamoDBDocumentClient.from(createDynamoDbClient(), {
				marshallOptions: { removeUndefinedValues: true }
			}),
			tableName
		};
	}

	return new MemoryDatabase();
}
