import { randomUUID } from 'node:crypto';

import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

import { createJobQuery } from '$lib/server/domain/job/create-job-query.js';
import { CreateJobParams } from '$lib/server/domain/job/job-resource.js';

import type { Actions } from './$types';

const skillJsonSchema = z
	.object({
		url: z.string(),
		text: z.string().optional(),
		ctid: z.string(),
		label: z.string().optional()
	})
	.transform((s) => ({
		url: s.url,
		ctid: s.ctid,
		label: s.label,
		// Derive from description or label so CE rows without a description still persist.
		text: (s.text?.trim() || s.label?.trim() || '').trim()
	}));

const frameworkJsonSchema = z.object({
	name: z.string(),
	organization: z.string(),
	url: z.string(),
	ctid: z.string()
});

export const actions: Actions = {
	createJob: async ({ request }) => {
		const fd = await request.formData();
		const name = String(fd.get('name') ?? '').trim();
		const company = String(fd.get('company') ?? '').trim();
		const description = String(fd.get('description') ?? '').trim();
		const skillsRaw = String(fd.get('skillsJson') ?? '');
		const frameworksRaw = String(fd.get('frameworksJson') ?? '');

		let skillsParsed: unknown;
		let frameworksParsed: unknown;
		try {
			skillsParsed = skillsRaw ? JSON.parse(skillsRaw) : [];
		} catch {
			return fail(400, {
				error: 'Invalid skills payload',
				values: { name, company, description }
			});
		}
		try {
			frameworksParsed = frameworksRaw ? JSON.parse(frameworksRaw) : [];
		} catch {
			return fail(400, {
				error: 'Invalid frameworks payload',
				values: { name, company, description }
			});
		}

		const skillsList = z.array(skillJsonSchema).safeParse(skillsParsed);
		const frameworksList = z.array(frameworkJsonSchema).safeParse(frameworksParsed);
		if (!skillsList.success) {
			return fail(400, {
				error: 'Skills must be a valid list',
				values: { name, company, description }
			});
		}
		if (!frameworksList.success) {
			return fail(400, {
				error: 'Frameworks must be a valid list',
				values: { name, company, description }
			});
		}

		const parsed = CreateJobParams.safeParse({
			externalId: `ext-${randomUUID()}`,
			name,
			company,
			description,
			frameworks: frameworksList.data,
			skills: skillsList.data,
			status: 'active'
		});

		if (!parsed.success) {
			const first = parsed.error.issues[0];
			return fail(400, {
				error: first?.message ?? 'Invalid job data',
				values: { name, company, description }
			});
		}

		await createJobQuery(parsed.data);
		redirect(303, '/jobs');
	}
};
