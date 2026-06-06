import { logServiceInitialized } from '$lib/server/util/log-service-initialized.js';

import { FakeVerificationExchange } from './fake-verification-exchange.js';
import type { VerificationExchangeCtx } from './verification-exchange.js';

export function provideFakeVerificationExchange(): VerificationExchangeCtx {
	const verificationExchange = FakeVerificationExchange();
	logServiceInitialized('verificationExchange', 'fake');
	return { verificationExchange };
}
