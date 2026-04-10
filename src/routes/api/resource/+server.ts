import { json } from '@sveltejs/kit';

import { isAllowedCredentialRegistryResourceUrl } from '$lib/server/services/skill-search/credential-engine/allowed-ce-resource-url.js';
import {
	normalizeCtdlResourceNode,
	pickPrimaryNodeFromJsonLd
} from '$lib/server/services/skill-search/credential-engine/normalize-ctdl-resource.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const resourceUrl = url.searchParams.get('url');
	if (!resourceUrl || resourceUrl.length < 10) {
		return json({ error: 'Missing or invalid url', requestId: locals.requestId }, { status: 400 });
	}

	let parsed: URL;
	try {
		parsed = new URL(resourceUrl);
	} catch {
		return json({ error: 'Invalid url', requestId: locals.requestId }, { status: 400 });
	}

	if (!isAllowedCredentialRegistryResourceUrl(parsed.toString())) {
		return json({ error: 'URL not allowed', requestId: locals.requestId }, { status: 400 });
	}

	try {
		const response = await fetch(parsed.toString(), {
			headers: { Accept: 'application/json, application/ld+json' }
		});
		if (!response.ok) {
			return json(
				{
					error: `Upstream ${response.status} ${response.statusText}`,
					requestId: locals.requestId
				},
				{ status: 502 }
			);
		}

		const data: unknown = await response.json();
		const node = pickPrimaryNodeFromJsonLd(data, parsed.toString());
		if (!node) {
			return json(
				{ error: 'Could not parse resource', requestId: locals.requestId },
				{ status: 502 }
			);
		}

		const normalized = normalizeCtdlResourceNode(node, parsed.toString());
		return json(normalized);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Resource fetch failed';
		return json({ error: message, requestId: locals.requestId }, { status: 500 });
	}
};
