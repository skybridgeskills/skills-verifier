import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { parseBaseEnv } from '$lib/server/app-env.js';

import { createDynamoDbClient } from './dynamo-client.js';
import { MemoryDatabase } from './memory-database.js';
import type { StorageDatabase } from './types.js';

/**
 * Builds storage: in-memory for `dev`/`test`, DynamoDB for `aws`.
 */
export function createStorageDatabase(env: Record<string, unknown>): StorageDatabase {
	const { CONTEXT } = parseBaseEnv(env);
	if (CONTEXT === 'dev' || CONTEXT === 'test') {
		return new MemoryDatabase();
	}

	const table = typeof env.DYNAMODB_TABLE === 'string' ? env.DYNAMODB_TABLE.trim() : '';
	if (!table) {
		throw new Error('DYNAMODB_TABLE is required when CONTEXT=aws');
	}

	const region =
		typeof env.AWS_REGION === 'string' && env.AWS_REGION.trim()
			? env.AWS_REGION.trim()
			: typeof env.AWS_DEFAULT_REGION === 'string' && env.AWS_DEFAULT_REGION.trim()
				? env.AWS_DEFAULT_REGION.trim()
				: undefined;

	const docClient = DynamoDBDocumentClient.from(createDynamoDbClient(region), {
		marshallOptions: { removeUndefinedValues: true }
	});

	return { $type: 'dynamo', docClient, tableName: table };
}
