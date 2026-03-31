import { describe, it, expect } from 'vitest';

import { FakeIdService } from './fake-id-service.js';
import { RealIdService } from './real-id-service.js';

describe('IdService', () => {
	describe('FakeIdService', () => {
		it('generates test strings with incrementing counters', () => {
			const service = FakeIdService();

			expect(service.testStr('name')).toBe('name-1');
			expect(service.testStr('name')).toBe('name-2');
			expect(service.testStr('other')).toBe('other-1');
			expect(service.testStr('other')).toBe('other-2');
		});

		it('generates secureUid using testStr', () => {
			const service = FakeIdService();

			expect(service.secureUid()).toBe('secure-1');
			expect(service.secureUid()).toBe('secure-2');
		});

		it('generates uniqueUid using testStr', () => {
			const service = FakeIdService();

			expect(service.uniqueUid()).toBe('unique-1');
			expect(service.uniqueUid()).toBe('unique-2');
		});

		it('resets counters for new instances', () => {
			const service1 = FakeIdService();
			service1.testStr('test');

			const service2 = FakeIdService();
			expect(service2.testStr('test')).toBe('test-1');
		});
	});

	describe('RealIdService', () => {
		it('generates unique secureUid values', () => {
			const service = RealIdService();
			const id1 = service.secureUid();
			const id2 = service.secureUid();

			expect(id1).not.toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
			expect(id2.length).toBeGreaterThan(0);
			// 128 bits should produce ~22 characters
			expect(id1.length).toBeGreaterThanOrEqual(20);
		});

		it('generates unique uniqueUid values', () => {
			const service = RealIdService();
			const id1 = service.uniqueUid();
			const id2 = service.uniqueUid();

			expect(id1).not.toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
			expect(id2.length).toBeGreaterThan(0);
			// 64 bits should produce ~11 characters
			expect(id1.length).toBeGreaterThanOrEqual(10);
		});

		it('generates test strings', () => {
			const service = RealIdService();
			const str = service.testStr('test');

			expect(str).toMatch(/^test-\d+-\d+$/);
		});
	});
});
