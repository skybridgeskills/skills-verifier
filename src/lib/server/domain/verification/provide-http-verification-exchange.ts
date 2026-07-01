import { logServiceInitialized } from '$lib/server/util/log-service-initialized.js';

import { HttpVerificationExchange } from './http-verification-exchange.js';
import type { VerificationConfig } from './verification-config.js';
import type { VerificationExchangeCtx } from './verification-exchange.js';

export function provideHttpVerificationExchange(
	config: VerificationConfig
): VerificationExchangeCtx {
	const verificationExchange = HttpVerificationExchange(config);
	logServiceInitialized('verificationExchange', 'http');
	return { verificationExchange };
}
