import { MemoryDatabase } from './memory-database.js';
import type { StorageDatabase } from './types.js';

/**
 * Builds in-memory storage for all environments for now.
 *
 * DynamoDB-backed storage is intentionally disabled until production persistence
 * is required. Query modules still implement `dynamo` branches; restoring cloud
 * storage is mainly: branch here on `DYNAMODB_TABLE` / `USE_MEMORY_STORAGE`,
 * wire `DynamoDBDocumentClient`, and validate against the single-table design.
 */
export function createStorageDatabase(): StorageDatabase {
	if (process.env.DYNAMODB_TABLE?.trim()) {
		console.warn(
			'[storage] DYNAMODB_TABLE is set but DynamoDB is not enabled in this build; using MemoryDatabase.'
		);
	}
	return new MemoryDatabase();
}
