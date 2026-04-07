import { logServiceInitialized } from '../../util/log-service-initialized.js';

import { createStorageDatabase } from './storage-database-factory.js';
import type { StorageDatabase } from './types.js';

export function StorageDatabaseCtx(): { database: StorageDatabase } {
	const database = createStorageDatabase();
	logServiceInitialized('database', 'memory');
	return { database };
}
