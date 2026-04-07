import { describe, expect, it } from 'vitest';

import { parseBaseEnv } from './app-env.js';

describe('parseBaseEnv', () => {
	it('defaults to dev when CONTEXT is unset', () => {
		expect(parseBaseEnv({}).CONTEXT).toBe('dev');
	});

	it('defaults to dev when CONTEXT is empty string', () => {
		expect(parseBaseEnv({ CONTEXT: '' }).CONTEXT).toBe('dev');
	});

	it('parses aws, dev, test', () => {
		expect(parseBaseEnv({ CONTEXT: 'aws' }).CONTEXT).toBe('aws');
		expect(parseBaseEnv({ CONTEXT: 'dev' }).CONTEXT).toBe('dev');
		expect(parseBaseEnv({ CONTEXT: 'test' }).CONTEXT).toBe('test');
	});

	it('rejects invalid CONTEXT', () => {
		expect(() => parseBaseEnv({ CONTEXT: 'staging' })).toThrow();
	});
});
