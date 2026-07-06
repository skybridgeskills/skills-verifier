import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

/**
 * Configuration for the DCC transaction service verify workflow.
 *
 * - `url` — transaction service base URI (`TRANSACTION_SERVICE_BASEURI`), the origin at which
 *   verify-workflow exchanges are created. When unset on dev, the fake exchange is used.
 * - `tenantName` — tenant to scope the exchange to (`TRANSACTION_SERVICE_TENANT`).
 * - `apiKey` — optional Bearer token (`TRANSACTION_SERVICE_TOKEN`). The DCC dev default
 *   has no auth; the auth header is sent only when this is set.
 * - `exchangeHost` — public origin a wallet must reach for the interact URL
 *   (`EXCHANGE_HOST` / `PUBLIC_APP_ORIGIN`). NOT localhost for real phones.
 * - `trustedRegistries` — optional list (`TRANSACTION_SERVICE_TRUSTED_REGISTRIES`,
 *   comma-separated); when empty DCC defaults apply.
 */
export const VerificationConfig = ZodFactory(
	z.object({
		url: z.string().trim(),
		tenantName: z.string().trim().default('default'),
		apiKey: z.string().trim().optional(),
		exchangeHost: z.string().trim(),
		trustedRegistries: z.array(z.string()).optional()
	})
);
export type VerificationConfig = ReturnType<typeof VerificationConfig>;

function readStr(env: Record<string, unknown>, key: string): string {
	const v = env[key];
	return typeof v === 'string' ? v.trim() : '';
}

/** Reads verification config from a flat env record. */
export function readVerificationConfig(env: Record<string, unknown>): VerificationConfig {
	const apiKey = readStr(env, 'TRANSACTION_SERVICE_TOKEN');
	const exchangeHost =
		readStr(env, 'EXCHANGE_HOST') || readStr(env, 'PUBLIC_APP_ORIGIN') || 'http://localhost:5173';
	const tenantName = readStr(env, 'TRANSACTION_SERVICE_TENANT') || 'default';
	const trusted = readStr(env, 'TRANSACTION_SERVICE_TRUSTED_REGISTRIES');
	const trustedRegistries = trusted
		? trusted
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		: undefined;

	return VerificationConfig({
		url: readStr(env, 'TRANSACTION_SERVICE_BASEURI'),
		tenantName,
		apiKey: apiKey.length > 0 ? apiKey : undefined,
		exchangeHost,
		trustedRegistries:
			trustedRegistries && trustedRegistries.length > 0 ? trustedRegistries : undefined
	});
}
