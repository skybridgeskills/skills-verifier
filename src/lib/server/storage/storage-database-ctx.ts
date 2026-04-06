import { createStorageDatabase } from './core/storage-database-factory.js';
import type { StorageDatabase } from './core/types.js';

export function StorageDatabaseCtx(): { database: StorageDatabase } {
	return { database: createStorageDatabase() };
}
