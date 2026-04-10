import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildVersionBody } from '$lib/server/util/build-version-body.js';

describe('buildVersionBody', () => {
	const prev = { ...process.env };

	beforeEach(() => {
		vi.unstubAllEnvs();
		delete process.env.SKILLS_VERIFIER_VERSION;
		delete process.env.APP_VERSION;
		delete process.env.SBS_MONOREPO_VERSION;
		delete process.env.BUILD_TIMESTAMP;
		delete process.env.BUILD_TIMESTAMP_PT;
	});

	afterEach(() => {
		process.env = { ...prev };
	});

	it('includes extra.sbsMonorepoVersion when SBS_MONOREPO_VERSION is set', () => {
		process.env.SBS_MONOREPO_VERSION = '2026.04.07-1';
		const body = buildVersionBody();
		expect(body.extra.sbsMonorepoVersion).toBe('2026.04.07-1');
	});

	it('prefers SKILLS_VERIFIER_VERSION over package version', () => {
		process.env.SKILLS_VERIFIER_VERSION = 'abc123';
		const body = buildVersionBody();
		expect(body.version).toBe('abc123');
	});
});
