import {
	extractExchangeId,
	extractProtocols,
	extractVerifiedCredentials,
	VerificationExchangeError
} from './parse-exchange-response.js';
import type { VerificationConfig } from './verification-config.js';
import {
	OPEN_BADGE_VERIFY_VARIABLES,
	type ExchangeStatus,
	type VerificationExchange
} from './verification-exchange.js';

function authHeader(config: VerificationConfig): Record<string, string> {
	if (!config.apiKey) return {};
	const basic = Buffer.from(`${config.tenantName}:${config.apiKey}`).toString('base64');
	return { Authorization: `Basic ${basic}` };
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
	if (!response.ok) {
		let bodyText = '';
		try {
			bodyText = await response.text();
		} catch {
			// best effort; never include auth header content
		}
		throw new VerificationExchangeError(`Transaction service returned ${response.status}`, {
			status: response.status,
			cause: bodyText
		});
	}
	const data = (await response.json()) as unknown;
	if (data === null || typeof data !== 'object' || Array.isArray(data)) {
		throw new VerificationExchangeError('Unexpected non-object response', { status: 200 });
	}
	return data as Record<string, unknown>;
}

/**
 * Real verification exchange backed by the DCC `dcc-transaction-service` verify workflow.
 * Never logs the API token; sends the Basic auth header only when an `apiKey` is configured.
 */
export function HttpVerificationExchange(config: VerificationConfig): VerificationExchange {
	const baseUrl = config.url.replace(/\/$/, '');

	return {
		async createVerifyExchange(): Promise<{
			exchangeId: string;
			protocols: ReturnType<typeof extractProtocols>;
		}> {
			const url = `${baseUrl}/workflows/verify/exchanges`;
			const body = {
				variables: {
					tenantName: config.tenantName,
					exchangeHost: config.exchangeHost,
					retrievalId: crypto.randomUUID(),
					...OPEN_BADGE_VERIFY_VARIABLES,
					...(config.trustedRegistries ? { trustedRegistries: config.trustedRegistries } : {})
				}
			};

			let response: Response;
			try {
				response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						...authHeader(config)
					},
					body: JSON.stringify(body)
				});
			} catch (err) {
				if (err instanceof VerificationExchangeError) throw err;
				throw new VerificationExchangeError('Failed to reach transaction service', { cause: err });
			}

			const data = await readJson(response);
			return {
				exchangeId: extractExchangeId(data),
				protocols: extractProtocols(data)
			};
		},

		async getExchangeStatus({ vcapi }): Promise<ExchangeStatus> {
			let response: Response;
			try {
				response = await fetch(vcapi, {
					method: 'GET',
					headers: {
						Accept: 'application/json',
						...authHeader(config)
					}
				});
			} catch (err) {
				if (err instanceof VerificationExchangeError) throw err;
				throw new VerificationExchangeError('Failed to reach transaction service', { cause: err });
			}

			const data = await readJson(response);
			const rawState = typeof data.state === 'string' ? data.state : 'pending';
			const state: ExchangeStatus['state'] =
				rawState === 'active' || rawState === 'complete' || rawState === 'invalid'
					? rawState
					: 'pending';

			if (state !== 'complete') {
				return { state, verifiedCredentials: [] };
			}

			return { state: 'complete', verifiedCredentials: extractVerifiedCredentials(data) };
		}
	};
}
