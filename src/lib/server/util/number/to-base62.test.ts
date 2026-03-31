import { describe, it, expect } from 'vitest';

import { toBase62 } from './to-base62.js';

describe('toBase62', () => {
	it('converts zero to padded zeros', () => {
		expect(toBase62(0n, 5)).toBe('00000');
		expect(toBase62(0n, 1)).toBe('0');
	});

	it('converts small numbers', () => {
		expect(toBase62(1n, 1)).toBe('1');
		expect(toBase62(10n, 1)).toBe('a');
		expect(toBase62(36n, 1)).toBe('A');
		expect(toBase62(61n, 1)).toBe('Z');
	});

	it('pads with leading zeros', () => {
		expect(toBase62(1n, 5)).toBe('00001');
		expect(toBase62(62n, 3)).toBe('010');
	});

	it('converts larger numbers', () => {
		expect(toBase62(62n, 1)).toBe('10');
		expect(toBase62(3844n, 1)).toBe('100'); // 62^2
	});

	it('produces correct length for required entropy', () => {
		// 64 bits of entropy should produce ~11 characters
		const bits64 = 64;
		const requiredLength = Math.ceil((bits64 * Math.log(2)) / Math.log(62));
		const result = toBase62(2n ** BigInt(bits64) - 1n, requiredLength);
		expect(result.length).toBe(requiredLength);
	});

	it('produces correct length for 128 bits of entropy', () => {
		// 128 bits of entropy should produce ~22 characters
		const bits128 = 128;
		const requiredLength = Math.ceil((bits128 * Math.log(2)) / Math.log(62));
		const result = toBase62(2n ** BigInt(bits128) - 1n, requiredLength);
		expect(result.length).toBe(requiredLength);
	});

	it('handles maximum BigInt values', () => {
		const large = 2n ** 128n - 1n;
		const result = toBase62(large, 22);
		expect(result.length).toBe(22);
		expect(result).not.toBe('0000000000000000000000');
	});
});
