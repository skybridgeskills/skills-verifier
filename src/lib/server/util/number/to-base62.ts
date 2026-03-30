/**
 * Convert a number to a base-62 string using an alphanumeric alphabet.
 * The output will be padded with leading zeros to reach the required length.
 *
 * Base 62 is used to allow for only alphanumeric characters in the string, avoiding
 * all separator and punctuation characters. This way, these characters can be used
 * for other purposes without being confused with the base-62 digits.
 *
 * @param num - The number to convert (as a BigInt)
 * @param requiredLength - The minimum length of the output string
 * @returns The base-62 string representation
 */
export function toBase62(num: bigint, requiredLength: number): string {
	let result = '';
	let remaining = num;

	// Convert the number to base-62
	while (remaining > 0n) {
		const remainder = Number(remaining % BigInt(base));
		result = alphabet[remainder] + result;
		remaining = remaining / BigInt(base);
	}

	// Pad with leading zeros if necessary
	while (result.length < requiredLength) {
		result = alphabet[0] + result;
	}

	return result;
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = alphabet.length;
