import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { describe, expect, it, vi } from 'vitest';

import { DynamoDBHealthCheck } from './dynamodb-health-check.js';

describe('DynamoDBHealthCheck', () => {
	it('returns UP when DescribeTable succeeds', async () => {
		const client = { send: vi.fn().mockResolvedValue({ Table: { TableStatus: 'ACTIVE' } }) };

		const check = DynamoDBHealthCheck({
			client: client as unknown as DynamoDBDocumentClient,
			tableName: 'test-table'
		});

		const result = await check.check();
		expect(result.status).toBe('UP');
		expect(result.details?.tableName).toBe('test-table');
		expect((result.details as { tableStatus?: string }).tableStatus).toBe('ACTIVE');
		expect(client.send).toHaveBeenCalledWith(expect.any(DescribeTableCommand));
	});

	it('returns DOWN when DescribeTable fails', async () => {
		const client = { send: vi.fn().mockRejectedValue(new Error('Connection refused')) };

		const check = DynamoDBHealthCheck({
			client: client as unknown as DynamoDBDocumentClient,
			tableName: 'test-table'
		});

		const result = await check.check();
		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('Connection refused');
	});

	it('uses custom name when provided', () => {
		const client = { send: vi.fn().mockResolvedValue({}) };
		const check = DynamoDBHealthCheck({
			client: client as unknown as DynamoDBDocumentClient,
			tableName: 'test-table',
			name: 'my-dynamodb'
		});

		expect(check.name).toBe('my-dynamodb');
	});
});
