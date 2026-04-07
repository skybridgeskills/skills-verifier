import { logServiceInitialized } from '../../util/log-service-initialized.js';
import { bytesToBigInt } from '../../util/number/bytes-to-big-int.js';
import { toBase62 } from '../../util/number/to-base62.js';

import type { IdService, IdServiceCtx } from './id-service.js';

/**
 * Generates secure random bytes using crypto.getRandomValues.
 */
function secureRandomBytes(count: number): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(count));
}

/**
 * Generates a base-62 ID with the given bits of entropy.
 */
function generateBase62Uid(bitsOfEntropy: number): string {
	// Get random bytes
	const bytes = secureRandomBytes(Math.ceil(bitsOfEntropy / 8));

	// Convert the bytes to a big number (working in base 256)
	const num = bytesToBigInt(bytes);

	// Calculate the required length to represent bitsOfEntropy in our base
	// log_base(2^bitsOfEntropy) = bitsOfEntropy * log_base(2)
	const requiredLength = Math.ceil((bitsOfEntropy * Math.log(2)) / Math.log(62));

	return toBase62(num, requiredLength);
}

/**
 * Real implementation of IdService using crypto for secure ID generation.
 */
export function RealIdService(): IdService {
	let testStrCounter = 0;

	return {
		testStr(prefix: string): string {
			// In production, use time-based string (not commonly used)
			testStrCounter++;
			return `${prefix}-${Date.now()}-${testStrCounter}`;
		},
		secureUid(): string {
			// 128 bits of entropy for unguessable IDs
			return generateBase62Uid(128);
		},
		uniqueUid(): string {
			// 64 bits of entropy for unique but guessable IDs
			return generateBase62Uid(64);
		}
	};
}
export type RealIdService = ReturnType<typeof RealIdService>;

export const RealIdServiceCtx = () => {
	const slice = { idService: RealIdService() } satisfies IdServiceCtx;
	logServiceInitialized('idService', 'real');
	return slice;
};
export type RealIdServiceCtx = ReturnType<typeof RealIdServiceCtx>;
