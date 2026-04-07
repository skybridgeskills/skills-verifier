import { json } from '@sveltejs/kit';
import { treeifyError, z } from 'zod';

import { appContext } from '$lib/server/app-context.js';
import { SkillSearchQuery } from '$lib/server/services/skill-search/skill-search-service.js';

import type { RequestHandler } from './$types';

const PostBody = z.object({
	query: z.string().min(1).max(200),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = PostBody.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Invalid request', details: treeifyError(parsed.error) }, { status: 400 });
	}

	try {
		const results = await appContext().skillSearchService.search(
			SkillSearchQuery({ query: parsed.data.query, limit: parsed.data.limit })
		);
		return json({
			results,
			meta: {
				query: parsed.data.query,
				count: results.length,
				limit: parsed.data.limit
			}
		});
	} catch {
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
