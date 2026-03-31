/**
 * Convert a byte array to a BigInt by treating the bytes as base-256 digits.
 *
 * @param bytes - The byte array to convert
 * @returns The resulting BigInt
 */
export function bytesToBigInt(bytes: Uint8Array): bigint {
	let num = 0n;
	for (const byte of bytes) {
		num = num * 256n + BigInt(byte);
	}
	return num;
}
