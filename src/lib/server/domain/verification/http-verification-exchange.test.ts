import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpVerificationExchange } from './http-verification-exchange.js';
import { VerificationExchangeError } from './parse-exchange-response.js';
import { VerificationConfig } from './verification-config.js';

const mockFetch = vi.fn();

function makeConfig(overrides: Partial<Parameters<typeof VerificationConfig>[0]> = {}) {
	return VerificationConfig({
		url: 'http://localhost:4004',
		tenantName: 'default',
		exchangeHost: 'http://localhost:5173',
		...overrides
	});
}

describe('HttpVerificationExchange', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', mockFetch);
		mockFetch.mockReset();
	});

	describe('createVerifyExchange', () => {
		it('POSTs OB3 variables + exchangeHost and parses flat protocols', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 'exch-1',
					iu: 'https://lcw.app/request?ex=exch-1',
					vcapi: 'http://localhost:4004/workflows/verify/exchanges/exch-1',
					lcw: 'https://lcw.app/lcw/exch-1',
					verifiablePresentationRequest: {}
				})
			});

			const svc = HttpVerificationExchange(makeConfig());
			const result = await svc.createVerifyExchange();

			expect(result.exchangeId).toBe('exch-1');
			expect(result.protocols.iu).toContain('exch-1');

			const [url, init] = mockFetch.mock.calls[0];
			expect(url).toBe('http://localhost:4004/workflows/verify/exchanges');
			expect(init.method).toBe('POST');
			const body = JSON.parse(init.body);
			expect(body.variables.tenantName).toBe('default');
			expect(body.variables.exchangeHost).toBe('http://localhost:5173');
			expect(body.variables.vprContext).toEqual([
				'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
			]);
			expect(body.variables.vprCredentialType).toEqual(['OpenBadgeCredential']);
			expect(typeof body.variables.retrievalId).toBe('string');
			// No auth header when no apiKey configured.
			expect(init.headers.Authorization).toBeUndefined();
		});

		it('derives exchangeId from the iu URL when no id field is present', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					protocols: {
						iu: 'https://lcw.app/interactions/abc-123',
						vcapi: 'http://localhost:4004/workflows/verify/exchanges/abc-123',
						lcw: 'x',
						verifiablePresentationRequest: {}
					}
				})
			});

			const svc = HttpVerificationExchange(makeConfig());
			const result = await svc.createVerifyExchange();
			expect(result.exchangeId).toBe('abc-123');
		});

		it('sends a Bearer auth header only when an apiKey is configured', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 'exch-2',
					iu: 'https://lcw.app/i/exch-2',
					vcapi: 'http://localhost:4004/v/exch-2',
					lcw: 'x',
					verifiablePresentationRequest: {}
				})
			});

			const svc = HttpVerificationExchange(makeConfig({ apiKey: 'secret-token' }));
			await svc.createVerifyExchange();

			const [, init] = mockFetch.mock.calls[0];
			// The transaction service requires a Bearer token; the header value is
			// the raw token by design. We never log the header (see JSDoc).
			expect(init.headers.Authorization).toBe('Bearer secret-token');
		});

		it('includes trustedRegistries when configured', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 'e',
					iu: 'https://x/e',
					vcapi: 'http://x/e',
					lcw: 'x',
					verifiablePresentationRequest: {}
				})
			});
			const svc = HttpVerificationExchange(makeConfig({ trustedRegistries: ['DCC Sandbox'] }));
			await svc.createVerifyExchange();
			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.variables.trustedRegistries).toEqual(['DCC Sandbox']);
		});

		it('throws VerificationExchangeError on a non-ok response', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				text: async () => 'boom'
			});
			const svc = HttpVerificationExchange(makeConfig());
			await expect(svc.createVerifyExchange()).rejects.toBeInstanceOf(VerificationExchangeError);
		});
	});

	describe('getExchangeStatus', () => {
		it('maps a complete payload (matchedCredentials) into VerifiedCredentialResult[]', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					state: 'complete',
					variables: {
						results: {
							default: {
								matchedCredentials: [
									{
										id: 'urn:uuid:cred-1',
										name: 'Patient Care',
										issuer: { id: 'did:web:issuer', name: 'Riverside College' },
										credentialSubject: { achievement: { name: 'Patient Care' } }
									},
									{
										// no top-level name -> derive from achievement; issuer falls back to id
										id: 'urn:uuid:cred-2',
										issuer: { id: 'did:web:issuer2' },
										credentialSubject: { achievement: { name: 'Medication Admin' } }
									}
								]
							}
						}
					}
				})
			});

			const svc = HttpVerificationExchange(makeConfig());
			const status = await svc.getExchangeStatus({
				exchangeId: 'e',
				vcapi: 'http://localhost:4004/v/e'
			});

			expect(status.state).toBe('complete');
			expect(status.verifiedCredentials).toHaveLength(2);
			expect(status.verifiedCredentials[0]).toMatchObject({
				credentialId: 'urn:uuid:cred-1',
				name: 'Patient Care',
				issuer: 'Riverside College'
			});
			expect(status.verifiedCredentials[1]).toMatchObject({
				credentialId: 'urn:uuid:cred-2',
				name: 'Medication Admin',
				issuer: 'did:web:issuer2'
			});
		});

		it('falls back to credentialResults[].verifiableCredential', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					state: 'complete',
					variables: {
						results: {
							default: {
								credentialResults: [
									{ verifiableCredential: { id: 'urn:uuid:cr-1', name: 'From CR' } }
								]
							}
						}
					}
				})
			});

			const svc = HttpVerificationExchange(makeConfig());
			const status = await svc.getExchangeStatus({ exchangeId: 'e', vcapi: 'http://x/e' });
			expect(status.verifiedCredentials).toEqual([
				{
					credentialId: 'urn:uuid:cr-1',
					raw: { id: 'urn:uuid:cr-1', name: 'From CR' },
					name: 'From CR',
					issuer: undefined
				}
			]);
		});

		it('returns non-complete with no credentials when state is pending', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ state: 'pending' })
			});
			const svc = HttpVerificationExchange(makeConfig());
			const status = await svc.getExchangeStatus({ exchangeId: 'e', vcapi: 'http://x/e' });
			expect(status.state).toBe('pending');
			expect(status.verifiedCredentials).toEqual([]);
		});

		it('treats a malformed/complete-but-empty payload as complete with no credentials', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ state: 'complete', variables: { results: {} } })
			});
			const svc = HttpVerificationExchange(makeConfig());
			const status = await svc.getExchangeStatus({ exchangeId: 'e', vcapi: 'http://x/e' });
			expect(status.state).toBe('complete');
			expect(status.verifiedCredentials).toEqual([]);
		});
	});
});
