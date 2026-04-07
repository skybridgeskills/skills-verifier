import { createStorageDatabase } from './storage-database-factory.js';
import type { StorageDatabase } from './types.js';

export function StorageDatabaseCtx(): { database: StorageDatabase } {
	return { database: createStorageDatabase() };
}
