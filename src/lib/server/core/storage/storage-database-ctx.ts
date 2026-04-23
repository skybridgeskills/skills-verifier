import { DynamoDBHealthCheck } from '../../health/checks/dynamodb-health-check.js';
import { HealthCheckSym } from '../../health/health-check.js';
import { logServiceInitialized } from '../../util/log-service-initialized.js';

import { createStorageDatabase } from './storage-database-factory.js';
import { isDynamoDatabase, isMemoryDatabase } from './types.js';

export function StorageDatabaseCtx(env: Record<string, unknown>) {
	return () => {
		const database = createStorageDatabase(env);
		logServiceInitialized('database', isMemoryDatabase(database) ? 'memory' : 'dynamo');
		if (isDynamoDatabase(database)) {
			return {
				database,
				[HealthCheckSym]: DynamoDBHealthCheck({
					client: database.docClient,
					tableName: database.tableName
				})
			};
		}
		return { database };
	};
}
