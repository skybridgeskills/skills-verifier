import { describe, it, expect } from 'vitest';

import { bytesToBigInt } from './bytes-to-big-int.js';

describe('bytesToBigInt', () => {
	it('converts zero bytes to zero', () => {
		const bytes = new Uint8Array([0]);
		expect(bytesToBigInt(bytes)).toBe(0n);
	});

	it('converts single byte values', () => {
		expect(bytesToBigInt(new Uint8Array([0]))).toBe(0n);
		expect(bytesToBigInt(new Uint8Array([1]))).toBe(1n);
		expect(bytesToBigInt(new Uint8Array([255]))).toBe(255n);
	});

	it('converts multi-byte values', () => {
		expect(bytesToBigInt(new Uint8Array([1, 0]))).toBe(256n);
		expect(bytesToBigInt(new Uint8Array([0, 1]))).toBe(1n);
		expect(bytesToBigInt(new Uint8Array([1, 1]))).toBe(257n);
		expect(bytesToBigInt(new Uint8Array([255, 255]))).toBe(65535n);
	});

	it('converts large byte arrays', () => {
		const bytes = new Uint8Array([1, 2, 3, 4, 5]);
		const result = bytesToBigInt(bytes);
		expect(result).toBeGreaterThan(0n);
		// 1*256^4 + 2*256^3 + 3*256^2 + 4*256 + 5
		expect(result).toBe(4328719365n);
	});

	it('handles empty array', () => {
		expect(bytesToBigInt(new Uint8Array([]))).toBe(0n);
	});
});
