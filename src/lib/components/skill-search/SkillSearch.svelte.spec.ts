import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { searchSkills } from '$lib/clients/skill-search-client';

import SkillSearch from './SkillSearch.svelte';

vi.mock('$lib/clients/skill-search-client', () => ({
	searchSkills: vi.fn()
}));

describe('SkillSearch', () => {
	beforeEach(() => {
		vi.mocked(searchSkills).mockReset();
		vi.mocked(searchSkills).mockResolvedValue([]);
	});

	it('calls searchSkills when Search button is clicked', async () => {
		render(SkillSearch, {
			selectedUrls: [],
			onToggle: () => {}
		});

		const input = page.getByLabelText(/search for skills/i);
		await input.fill('ab');

		await page.getByRole('button', { name: /^search$/i }).click();

		expect(searchSkills).toHaveBeenCalledWith('ab', 20);
	});

	it('calls searchSkills when Enter is pressed in the input', async () => {
		const { container } = render(SkillSearch, {
			selectedUrls: [],
			onToggle: () => {}
		});

		const inputLocator = page.getByLabelText(/search for skills/i);
		await inputLocator.fill('xy');

		const native = container.querySelector<HTMLInputElement>('#skill-search-input');
		expect(native).toBeTruthy();
		native!.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		);

		expect(searchSkills).toHaveBeenCalledWith('xy', 20);
	});
});
