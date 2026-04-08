import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createStorageDatabase } from './storage-database-factory.js';
import { isDynamoDatabase, isMemoryDatabase } from './types.js';

describe('createStorageDatabase', () => {
	const prev = { ...process.env };

	beforeEach(() => {
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		process.env = { ...prev };
	});

	it('uses memory for CONTEXT=dev', () => {
		const db = createStorageDatabase({ CONTEXT: 'dev' });
		expect(isMemoryDatabase(db)).toBe(true);
	});

	it('uses memory for CONTEXT=test', () => {
		const db = createStorageDatabase({ CONTEXT: 'test' });
		expect(isMemoryDatabase(db)).toBe(true);
	});

	it('uses Dynamo when CONTEXT=aws and DYNAMODB_TABLE set', () => {
		const db = createStorageDatabase({
			CONTEXT: 'aws',
			DYNAMODB_TABLE: 'skills-verifier-staging',
			AWS_REGION: 'us-west-2'
		});
		expect(isDynamoDatabase(db)).toBe(true);
		if (isDynamoDatabase(db)) {
			expect(db.tableName).toBe('skills-verifier-staging');
		}
	});

	it('throws when CONTEXT=aws and DYNAMODB_TABLE missing', () => {
		expect(() => createStorageDatabase({ CONTEXT: 'aws', DYNAMODB_TABLE: '' })).toThrow(
			/DYNAMODB_TABLE/
		);
	});
});
