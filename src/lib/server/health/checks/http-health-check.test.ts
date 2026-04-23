import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { HttpHealthCheck } from './http-health-check.js';

describe('HttpHealthCheck', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it('returns UP on 200 OK', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('UP');
		expect((result.details as { statusCode?: number }).statusCode).toBe(200);
	});

	it('returns UP on any 2xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 204,
			statusText: 'No Content'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('UP');
	});

	it('returns DOWN on 5xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 503,
			statusText: 'Service Unavailable'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('503');
	});

	it('returns DEGRADED on 4xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DEGRADED');
		expect(result.error).toContain('404');
	});

	it('returns DOWN on network error', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('ECONNREFUSED');
	});

	it('includes Authorization header when apiKey is provided', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com',
			apiKey: 'my-secret-key'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith(
			'https://api.example.com/health',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer my-secret-key'
				}) as Record<string, string>
			})
		);
	});

	it('uses custom path when provided', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com',
			path: '/api/health'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith(
			'https://api.example.com/api/health',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('normalizes trailing slashes in baseUrl', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com/',
			path: '/health'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith(
			'https://api.example.com/health',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('captures duration in details', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect((result.details as { durationMs?: number }).durationMs).toBeGreaterThanOrEqual(0);
	});
});
