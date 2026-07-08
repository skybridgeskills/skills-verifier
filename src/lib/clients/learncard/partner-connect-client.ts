/**
 * Client-only wrapper around `@learncard/partner-connect`. Requesting credentials from the
 * LearnCard host wallet only works in the browser (postMessage to the parent frame), so the SDK is
 * dynamically imported at call time to keep it out of the SSR bundle.
 *
 * We build our own minimal, type-based `QueryByExample` for `OpenBadgeCredential` (Open Badges v3
 * context) — independent of what the verify exchange requested — and sign against the
 * server-provided `challenge`/`domain` so the transaction service accepts the presentation.
 */

/** Open Badges v3 context that scopes the credential query (mirrors the server's verify variables). */
const OPEN_BADGE_V3_CONTEXT = 'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json';

/** How long to wait for the LearnCard host to answer before giving up (SDK default is 30s). */
const REQUEST_TIMEOUT_MS = 10_000;

export interface RequestCredentialsInput {
	/** LearnCard host origin (configurable; defaults to `https://learncard.app`). */
	hostOrigin: string;
	/** Challenge the exchange expects the presentation to be signed against. */
	challenge: string;
	/** Domain the exchange expects the presentation to be signed against. */
	domain: string;
}

/**
 * Ask the LearnCard host wallet for an Open Badge credential. Resolves with the raw Verifiable
 * Presentation the user shared, or `null` when the user shared nothing. SDK errors
 * (`USER_REJECTED`, `LC_TIMEOUT`, …) propagate to the caller.
 */
export async function requestOpenBadgeCredentials(
	input: RequestCredentialsInput
): Promise<unknown | null> {
	const { createPartnerConnect } = await import('@learncard/partner-connect');
	const learnCard = createPartnerConnect({
		hostOrigin: input.hostOrigin,
		requestTimeout: REQUEST_TIMEOUT_MS
	});

	try {
		const response = await learnCard.askCredentialSearch({
			query: [
				{
					type: 'QueryByExample',
					credentialQuery: {
						reason: 'Verify your credentials for this role',
						example: {
							'@context': [OPEN_BADGE_V3_CONTEXT],
							type: 'OpenBadgeCredential'
						}
					}
				}
			],
			challenge: input.challenge,
			domain: input.domain
		});

		return response.verifiablePresentation ?? null;
	} finally {
		learnCard.destroy();
	}
}
