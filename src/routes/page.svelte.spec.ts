import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('links to create job (fallback when load is not run)', async () => {
		render(Page);

		const link = page.getByRole('link', { name: /create job/i });
		await expect.element(link).toBeInTheDocument();
		await expect.element(link).toHaveAttribute('href', '/jobs/create');
	});
});
