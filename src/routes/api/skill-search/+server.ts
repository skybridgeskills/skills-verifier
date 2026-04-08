import { json } from '@sveltejs/kit';
import { treeifyError, z } from 'zod';

import { appContext } from '$lib/server/app-context.js';
import { appLogger } from '$lib/server/services/logging/index.js';
import {
	SkillRegistrySearchMode,
	SkillSearchQuery
} from '$lib/server/services/skill-search/skill-search-service.js';

import type { RequestHandler } from './$types';

const PostBody = z.object({
	query: z.string().min(1).max(200),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
	mode: SkillRegistrySearchMode.optional().default('skills')
});

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body', requestId: locals.requestId }, { status: 400 });
	}

	const parsed = PostBody.safeParse(body);
	if (!parsed.success) {
		return json(
			{
				error: 'Invalid request',
				details: treeifyError(parsed.error),
				requestId: locals.requestId
			},
			{ status: 400 }
		);
	}

	try {
		appLogger().debug(
			{
				query: parsed.data.query,
				limit: parsed.data.limit,
				mode: parsed.data.mode,
				requestId: locals.requestId
			},
			'Skill search started'
		);

		const searchQuery = SkillSearchQuery({
			query: parsed.data.query,
			limit: parsed.data.limit
		});
		const skillSearchService = appContext().skillSearchService;

		const results =
			parsed.data.mode === 'skills'
				? await skillSearchService.search(searchQuery)
				: parsed.data.mode === 'containers'
					? await skillSearchService.searchContainers(searchQuery)
					: await skillSearchService.searchFrameworks(searchQuery);

		appLogger().debug(
			{ count: results.length, mode: parsed.data.mode, requestId: locals.requestId },
			'Skill search completed'
		);
		return json({
			results,
			meta: {
				query: parsed.data.query,
				count: results.length,
				limit: parsed.data.limit,
				mode: parsed.data.mode
			}
		});
	} catch (error) {
		appLogger().error({ err: error, requestId: locals.requestId }, 'Skill search failed');
		const message = error instanceof Error ? error.message : 'Search failed';
		return json({ error: message, requestId: locals.requestId }, { status: 500 });
	}
};
