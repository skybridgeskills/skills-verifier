import { HealthCheck } from '../health-check.js';

function nowMs(): number {
	return Date.now();
}

export interface HttpHealthCheckOpts {
	name: string;
	baseUrl: string;
	path?: string;
	apiKey?: string;
}

/**
 * `GET` probe for an HTTP dependency. 2xx → UP, 5xx → DOWN, other → DEGRADED.
 */
export function HttpHealthCheck(opts: HttpHealthCheckOpts) {
	const { name, baseUrl, path = '/health', apiKey } = opts;
	const normalizedBase = baseUrl.replace(/\/$/, '');
	const url = `${normalizedBase}${path}`;

	async function check() {
		const startedAt = nowMs();
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers['Authorization'] = `Bearer ${apiKey}`;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers,
				signal: AbortSignal.timeout(5000)
			});

			const durationMs = nowMs() - startedAt;

			if (response.ok) {
				return {
					status: 'UP' as const,
					details: { url, statusCode: response.status, durationMs }
				};
			}

			if (response.status >= 500) {
				return {
					status: 'DOWN' as const,
					error: `HTTP ${response.status} ${response.statusText}`,
					details: { url, statusCode: response.status, durationMs }
				};
			}

			return {
				status: 'DEGRADED' as const,
				error: `HTTP ${response.status} ${response.statusText}`,
				details: { url, statusCode: response.status, durationMs }
			};
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			return {
				status: 'DOWN' as const,
				error,
				details: { url, durationMs: nowMs() - startedAt }
			};
		}
	}

	return HealthCheck({ name, check });
}
