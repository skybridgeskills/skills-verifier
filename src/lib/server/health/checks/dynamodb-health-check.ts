import { DescribeTableCommand, type DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { HealthCheck } from '../health-check.js';

export interface DynamoDBHealthCheckOpts {
	client: DynamoDBDocumentClient;
	tableName: string;
	name?: string;
}

function nowMs(): number {
	return Date.now();
}

/**
 * Probes DynamoDB with `DescribeTable` for the configured table.
 */
export function DynamoDBHealthCheck(opts: DynamoDBHealthCheckOpts) {
	const { client, tableName, name = 'dynamodb' } = opts;

	async function check() {
		const startedAt = nowMs();
		try {
			const out: DescribeTableCommandOutput = await client.send(
				new DescribeTableCommand({ TableName: tableName })
			);
			return {
				status: 'UP' as const,
				details: {
					tableName,
					tableStatus: out.Table?.TableStatus,
					durationMs: nowMs() - startedAt
				}
			};
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			return {
				status: 'DOWN' as const,
				error,
				details: { tableName, durationMs: nowMs() - startedAt }
			};
		}
	}

	return HealthCheck({ name, check });
}
