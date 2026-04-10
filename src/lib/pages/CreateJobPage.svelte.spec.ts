import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CreateJobPage from './CreateJobPage.svelte';

describe('CreateJobPage', () => {
	it('renders exactly one form so skill search is not nested inside job submit', async () => {
		render(CreateJobPage, { form: undefined });

		expect(document.querySelectorAll('form').length).toBe(1);
	});
});
