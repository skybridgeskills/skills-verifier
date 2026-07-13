import type {
	ExchangeProtocols,
	VerificationProblem,
	VerifiedCredentialResult
} from './verification-exchange.js';

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

/**
 * Read `{ challenge, domain }` from a VC-API VerifiablePresentationRequest. Accepts either the
 * VPR object directly or a participate-response envelope (`{ verifiablePresentationRequest }`).
 * Throws when either field is absent — callers should not sign against a partial challenge.
 */
export function extractPresentationChallenge(data: unknown): {
	challenge: string;
	domain: string;
} {
	const record = asRecord(data);
	const vpr = asRecord(record?.verifiablePresentationRequest) ?? record;
	const challenge = typeof vpr?.challenge === 'string' ? vpr.challenge : '';
	const domain = typeof vpr?.domain === 'string' ? vpr.domain : '';
	if (!challenge || !domain) {
		throw new VerificationExchangeError('VPR missing challenge/domain', { status: 200 });
	}
	return { challenge, domain };
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

/**
 * Map a single VC into a `VerifiedCredentialResult`. Defaults to `verified: true`
 * with no problems; callers that read from `credentialResults[]` override those
 * with the verifier-core status + distilled problems.
 */
function toVerifiedCredential(vc: unknown, index: number): VerifiedCredentialResult {
	const record = asRecord(vc) ?? {};
	const credentialId =
		typeof record.id === 'string' && record.id.length > 0 ? record.id : `credential-${index}`;
	return {
		credentialId,
		raw: vc,
		name: deriveName(record),
		issuer: deriveIssuer(record),
		verified: true,
		problems: []
	};
}

/** A single verifier-core check result (per-credential `results[]` / VP `presentationResults[]`). */
interface RawCheckResult {
	id?: string;
	check?: string;
	fatal?: boolean;
	outcome?: { status?: string; problems?: Array<{ title?: string; detail?: string }> };
}

/**
 * Distill a verifier-core `results[]` / `presentationResults[]` array into
 * `VerificationProblem[]`. Only `outcome.status === 'failure'` entries become
 * problems; a `fatal` failed check is marked critical (`fatal: true`).
 */
function extractProblems(results: unknown): VerificationProblem[] {
	if (!Array.isArray(results)) return [];
	const out: VerificationProblem[] = [];
	for (const entry of results) {
		const r = asRecord(entry) as RawCheckResult | undefined;
		if (!r?.outcome || r.outcome.status !== 'failure') continue;
		const fatal = r.fatal === true;
		const check = typeof r.id === 'string' ? r.id : r.check;
		const problems = Array.isArray(r.outcome.problems) ? r.outcome.problems : [];
		if (problems.length === 0) {
			out.push({ check, title: check ?? 'Verification failed', fatal });
			continue;
		}
		for (const p of problems) {
			const pr = asRecord(p);
			const title =
				typeof pr?.title === 'string' && pr.title ? pr.title : (check ?? 'Verification failed');
			const detail = typeof pr?.detail === 'string' && pr.detail ? pr.detail : undefined;
			out.push({ check, title, detail, fatal });
		}
	}
	return out;
}

/** The `results.default` (verifier-core output), present only for complete/invalid exchanges. */
function resultsDefault(data: Record<string, unknown>): Record<string, unknown> | undefined {
	return asRecord(asRecord(asRecord(data.variables)?.results)?.default);
}

/**
 * Map a verify-exchange response's `variables.results.default` into
 * `VerifiedCredentialResult[]`. Prefers `credentialResults[]` (so per-credential
 * `verified` + distilled `problems` come through), falling back to the
 * `matchedCredentials` VC list (verified, no problems). Returns `[]` when neither
 * is present.
 */
export function extractVerifiedCredentials(
	data: Record<string, unknown>
): VerifiedCredentialResult[] {
	const def = resultsDefault(data);
	if (!def) return [];

	const credentialResults = def.credentialResults;
	if (Array.isArray(credentialResults) && credentialResults.length > 0) {
		return credentialResults.map((entry, index) => {
			const cr = asRecord(entry) ?? {};
			const base = toVerifiedCredential(cr.verifiableCredential, index);
			return {
				...base,
				verified: cr.verified !== false, // default true when absent
				problems: extractProblems(cr.results)
			};
		});
	}

	const matched = def.matchedCredentials;
	if (Array.isArray(matched) && matched.length > 0) {
		return matched.map((vc, index) => toVerifiedCredential(vc, index));
	}

	return [];
}

/** Distill VP-level problems from `results.default.presentationResults[]`. */
export function extractPresentationProblems(data: Record<string, unknown>): VerificationProblem[] {
	return extractProblems(resultsDefault(data)?.presentationResults);
}
