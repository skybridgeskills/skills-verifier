import { describe, expect, it } from 'vitest';

import { CreateJobParams } from './job-resource.js';

const baseJob = {
	externalId: 'ext-test',
	name: 'Engineer',
	company: 'Co',
	description: 'Build things',
	frameworks: [],
	skills: [
		{
			url: 'https://example.com/skill',
			text: 'Skill',
			ctid: 'ctid:1'
		}
	],
	status: 'active' as const
};

describe('CreateJobParams', () => {
	it('accepts omitted externalUrl', () => {
		const r = CreateJobParams.safeParse(baseJob);
		expect(r.success).toBe(true);
		if (r.success) expect(r.data.externalUrl).toBeUndefined();
	});

	it('accepts valid https apply URL', () => {
		const r = CreateJobParams.safeParse({
			...baseJob,
			externalUrl: 'https://example.com/apply'
		});
		expect(r.success).toBe(true);
	});

	it('rejects invalid URL string', () => {
		const r = CreateJobParams.safeParse({
			...baseJob,
			externalUrl: 'not-a-url'
		});
		expect(r.success).toBe(false);
	});

	it('rejects non-http(s) URL', () => {
		const r = CreateJobParams.safeParse({
			...baseJob,
			externalUrl: 'ftp://example.com/apply'
		});
		expect(r.success).toBe(false);
	});
});
