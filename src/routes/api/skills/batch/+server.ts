import { json } from '@sveltejs/kit';
import { treeifyError, z } from 'zod';

import { isAllowedCredentialRegistryResourceUrl } from '$lib/server/services/skill-search/credential-engine/allowed-ce-resource-url.js';
import { buildBatchByIdRequest } from '$lib/server/services/skill-search/credential-engine/build-batch-by-id-request.js';
import { mapCredentialEngineSearchResponse } from '$lib/server/services/skill-search/credential-engine/map-credential-engine-search-response.js';
import { pickPrimaryNodeFromJsonLd } from '$lib/server/services/skill-search/credential-engine/normalize-ctdl-resource.js';
import { postCeAssistantSearch } from '$lib/server/services/skill-search/credential-engine/post-ce-assistant-search.js';

import type { RequestHandler } from './$types';

import { env } from '$env/dynamic/private';

const PostBody = z.object({
	urls: z.array(z.string().url()).min(1).max(100)
});

async function fetchCompetencyViaGet(
	url: string
): Promise<ReturnType<typeof mapCredentialEngineSearchResponse>[number] | null> {
	if (!isAllowedCredentialRegistryResourceUrl(url)) return null;
	const response = await fetch(url, {
		headers: { Accept: 'application/json, application/ld+json' }
	});
	if (!response.ok) return null;
	const data: unknown = await response.json();
	const node = pickPrimaryNodeFromJsonLd(data, url);
	if (!node) return null;
	const mapped = mapCredentialEngineSearchResponse({ data: [node] });
	return mapped[0] ?? null;
}

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

	const urls = parsed.data.urls;
	for (const u of urls) {
		if (!isAllowedCredentialRegistryResourceUrl(u)) {
			return json(
				{ error: 'URL not allowed for batch fetch', requestId: locals.requestId },
				{ status: 400 }
			);
		}
	}

	const searchUrl =
		typeof env.CREDENTIAL_ENGINE_SEARCH_URL === 'string'
			? env.CREDENTIAL_ENGINE_SEARCH_URL.trim()
			: '';
	const apiKey =
		typeof env.CREDENTIAL_ENGINE_API_KEY === 'string' ? env.CREDENTIAL_ENGINE_API_KEY.trim() : '';

	try {
		let results: ReturnType<typeof mapCredentialEngineSearchResponse>;

		if (searchUrl.length > 0 && apiKey.length > 0) {
			const ceBody = buildBatchByIdRequest(urls, searchUrl);
			const ceResponse = await postCeAssistantSearch(searchUrl, apiKey, ceBody);
			results = mapCredentialEngineSearchResponse(ceResponse);
		} else {
			const settled = await Promise.all(urls.map((u) => fetchCompetencyViaGet(u)));
			results = settled.filter((x): x is NonNullable<typeof x> => x !== null);
		}

		return json({ results, meta: { count: results.length } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Batch fetch failed';
		return json({ error: message, requestId: locals.requestId }, { status: 500 });
	}
};
