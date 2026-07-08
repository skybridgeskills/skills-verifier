import { providerCtx } from '$lib/server/util/provider/provider-ctx.js';

/**
 * Multi-protocol interaction options returned by the DCC transaction service when an
 * exchange is created. `iu` is the interaction URL a wallet opens; `vcapi` is the
 * VC-API endpoint the server polls for exchange status.
 */
export interface ExchangeProtocols {
	iu: string;
	vcapi: string;
	lcw: string;
	verifiablePresentationRequest: object;
}

/**
 * A single verified credential extracted from a completed verify exchange.
 * `raw` is the full OpenBadgeCredential JSON; `name`/`issuer` are best-effort
 * display fields derived from the credential.
 */
export interface VerifiedCredentialResult {
	credentialId: string;
	raw: unknown;
	name?: string;
	issuer?: string;
}

/**
 * Status of a verify exchange. `verifiedCredentials` is populated only when
 * `state === 'complete'`.
 */
export interface ExchangeStatus {
	state: 'pending' | 'active' | 'complete' | 'invalid';
	verifiedCredentials: VerifiedCredentialResult[];
}

/**
 * The `challenge` + `domain` a wallet must sign a presentation against for a given exchange,
 * read from the exchange's Verifiable Presentation Request. A client that obtains the VP itself
 * (e.g. an embedded app) must sign against these exact values or the transaction service rejects it.
 */
export interface ExchangePresentationChallenge {
	challenge: string;
	domain: string;
}

/**
 * Service for creating and polling DCC verify exchanges (Open Badges v3).
 */
export interface VerificationExchange {
	createVerifyExchange(): Promise<{ exchangeId: string; protocols: ExchangeProtocols }>;
	getExchangeStatus(input: { exchangeId: string; vcapi: string }): Promise<ExchangeStatus>;

	/**
	 * Fetch the exchange's Verifiable Presentation Request from its participate endpoint and
	 * return the `challenge`/`domain` a wallet must sign against. Used when a client obtains the
	 * VP itself rather than via the interaction URL, so we can hand those values to the wallet.
	 */
	fetchExchangeVpr(input: { vcapi: string }): Promise<ExchangePresentationChallenge>;

	/**
	 * Relay a caller-supplied Verifiable Presentation to the exchange's participate endpoint so
	 * the transaction service verifies it, then report the resulting status. The VP is verified
	 * server-side by the transaction service — it is never trusted/parsed as pre-verified here.
	 */
	submitPresentation(input: {
		vcapi: string;
		verifiablePresentation: unknown;
	}): Promise<ExchangeStatus>;
}

export type VerificationExchangeCtx = { verificationExchange: VerificationExchange };

/**
 * VPR variables that scope a verify exchange to Open Badges v3 credentials.
 * Passed verbatim in the create-exchange request body.
 */
export const OPEN_BADGE_VERIFY_VARIABLES = {
	vprContext: ['https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'],
	vprCredentialType: ['OpenBadgeCredential'],
	vprClaims: [] as unknown[]
};

/** Verification exchange service from the current app context (see hooks / tests). */
export function verificationExchange(): VerificationExchange {
	return providerCtx<VerificationExchangeCtx>().verificationExchange;
}
