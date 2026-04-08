import { logServiceInitialized } from '../../util/log-service-initialized.js';

import { createStorageDatabase } from './storage-database-factory.js';
import { isMemoryDatabase } from './types.js';

export function StorageDatabaseCtx(env: Record<string, unknown>) {
	return () => {
		const database = createStorageDatabase(env);
		logServiceInitialized('database', isMemoryDatabase(database) ? 'memory' : 'dynamo');
		return { database };
	};
}
