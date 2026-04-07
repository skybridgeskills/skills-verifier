import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import type { MemoryDatabase } from './memory-database.js';

/**
 * Wraps DynamoDB document client + table name for queries.
 */
export type DynamoStorageDatabase = {
	readonly $type: 'dynamo';
	readonly docClient: DynamoDBDocumentClient;
	readonly tableName: string;
};

/**
 * Either in-memory store (tests, local dev) or DynamoDB (deployed).
 */
export type StorageDatabase = MemoryDatabase | DynamoStorageDatabase;

export function isMemoryDatabase(db: StorageDatabase): db is MemoryDatabase {
	return db.$type === 'memory';
}

export function isDynamoDatabase(db: StorageDatabase): db is DynamoStorageDatabase {
	return db.$type === 'dynamo';
}
