import type { ExchangeProtocols, VerifiedCredentialResult } from './verification-exchange.js';

/** Typed upstream error for the verification exchange (class-light error). */
export class VerificationExchangeError extends Error {
	status?: number;
	constructor(message: string, opts?: { status?: number; cause?: unknown }) {
		super(message);
		this.name = 'VerificationExchangeError';
		if (opts?.status !== undefined) this.status = opts.status;
		if (opts?.cause !== undefined) (this as Error & { cause?: unknown }).cause = opts.cause;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}

/**
 * Extract the protocols object from the upstream response. Handles both the flat shape
 * (`{ iu, vcapi, lcw, verifiablePresentationRequest }`) and a nested shape
 * (`{ protocols: { iu, ... } }`), mirroring orca's `extractProtocols`.
 */
export function extractProtocols(data: Record<string, unknown>): ExchangeProtocols {
	const raw = asRecord(data.protocols) ?? data;
	if (typeof raw.iu !== 'string') {
		throw new VerificationExchangeError('Missing protocols in response', { status: 200 });
	}
	return raw as unknown as ExchangeProtocols;
}

/**
 * Extract the exchange ID. Prefers a direct `id` field, falling back to the last path
 * segment of the `iu` interaction URL.
 */
export function extractExchangeId(data: Record<string, unknown>): string {
	if (typeof data.id === 'string' && data.id.length > 0) {
		return data.id;
	}
	const raw = asRecord(data.protocols) ?? data;
	if (typeof raw.iu === 'string') {
		try {
			const lastSegment = new URL(raw.iu).pathname.split('/').filter(Boolean).pop();
			if (lastSegment) return lastSegment;
		} catch {
			// invalid URL — fall through to error
		}
	}
	throw new VerificationExchangeError('Could not determine exchangeId from response', {
		status: 200
	});
}

/** Best-effort display name from an OpenBadgeCredential VC. */
function deriveName(vc: Record<string, unknown>): string | undefined {
	if (typeof vc.name === 'string' && vc.name.length > 0) return vc.name;
	const subject = asRecord(vc.credentialSubject);
	const achievement = asRecord(subject?.achievement);
	if (achievement && typeof achievement.name === 'string') return achievement.name;
	return undefined;
}

/** Best-effort issuer label from an OpenBadgeCredential VC. */
function deriveIssuer(vc: Record<string, unknown>): string | undefined {
	const issuer = asRecord(vc.issuer);
	if (issuer) {
		if (typeof issuer.name === 'string' && issuer.name.length > 0) return issuer.name;
		if (typeof issuer.id === 'string' && issuer.id.length > 0) return issuer.id;
	}
	if (typeof vc.issuer === 'string' && vc.issuer.length > 0) return vc.issuer;
	return undefined;
}

/** Map a single VC into a VerifiedCredentialResult. */
function toVerifiedCredential(vc: unknown, index: number): VerifiedCredentialResult {
	const record = asRecord(vc) ?? {};
	const credentialId =
		typeof record.id === 'string' && record.id.length > 0 ? record.id : `credential-${index}`;
	return {
		credentialId,
		raw: vc,
		name: deriveName(record),
		issuer: deriveIssuer(record)
	};
}

/**
 * Map a completed verify-exchange response's `variables.results.default` into
 * `VerifiedCredentialResult[]`. Prefers `matchedCredentials`, falling back to
 * `credentialResults[].verifiableCredential`. Returns `[]` when neither is present.
 */
export function extractVerifiedCredentials(
	data: Record<string, unknown>
): VerifiedCredentialResult[] {
	const variables = asRecord(data.variables);
	const results = asRecord(variables?.results);
	const def = asRecord(results?.default);
	if (!def) return [];

	const matched = def.matchedCredentials;
	if (Array.isArray(matched) && matched.length > 0) {
		return matched.map(toVerifiedCredential);
	}

	const credentialResults = def.credentialResults;
	if (Array.isArray(credentialResults)) {
		return credentialResults
			.map((entry) => asRecord(entry)?.verifiableCredential)
			.filter((vc) => vc !== undefined)
			.map(toVerifiedCredential);
	}

	return [];
}
