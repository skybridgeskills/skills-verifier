/**
 * POST JSON to Credential Engine assistant search endpoint.
 */
export async function postCeAssistantSearch(
	searchUrl: string,
	apiKey: string,
	body: unknown
): Promise<unknown> {
	const response = await fetch(searchUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => 'Unable to read error body');
		throw new Error(`CE search failed: ${response.status} ${response.statusText} - ${errorBody}`);
	}

	return response.json();
}
