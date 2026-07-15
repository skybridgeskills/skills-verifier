import { describe, expect, it } from 'vitest';

import { safeNext } from './safe-next.js';

describe('safeNext', () => {
	it('allows local absolute paths', () => {
		expect(safeNext('/')).toBe('/');
		expect(safeNext('/jobs')).toBe('/jobs');
		expect(safeNext('/jobs/abc?tab=1')).toBe('/jobs/abc?tab=1');
	});

	it('falls back to / for empty or missing input', () => {
		expect(safeNext(null)).toBe('/');
		expect(safeNext(undefined)).toBe('/');
		expect(safeNext('')).toBe('/');
	});

	it('blocks protocol-relative and absolute redirects (open redirect)', () => {
		expect(safeNext('//evil.com')).toBe('/');
		expect(safeNext('/\\evil.com')).toBe('/');
		expect(safeNext('https://evil.com')).toBe('/');
		expect(safeNext('http://evil.com')).toBe('/');
		expect(safeNext('javascript:alert(1)')).toBe('/');
		expect(safeNext('evil.com')).toBe('/');
	});
});
