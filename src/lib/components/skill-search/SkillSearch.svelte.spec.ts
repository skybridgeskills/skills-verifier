import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { searchSkills } from '$lib/clients/skill-search-client';

import SkillSearch from './SkillSearch.svelte';

vi.mock('$lib/clients/skill-search-client', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/clients/skill-search-client.js')>();
	return {
		...actual,
		searchSkills: vi.fn()
	};
});

describe('SkillSearch', () => {
	beforeEach(() => {
		vi.mocked(searchSkills).mockReset();
		vi.mocked(searchSkills).mockResolvedValue([]);
	});

	it('calls searchSkills when Search button is clicked', async () => {
		render(SkillSearch, {
			selectedUrls: [],
			onToggleSkill: () => {}
		});

		const input = page.getByLabelText(/skills and related entities/i);
		await input.fill('ab');

		await page.getByRole('button', { name: /^search$/i }).click();

		expect(searchSkills).toHaveBeenCalledWith('ab', { limit: 20, mode: 'skills' });
	});

	it('calls searchSkills when Enter is pressed in the input', async () => {
		const { container } = render(SkillSearch, {
			selectedUrls: [],
			onToggleSkill: () => {}
		});

		const inputLocator = page.getByLabelText(/skills and related entities/i);
		await inputLocator.fill('xy');

		const native = container.querySelector<HTMLInputElement>('#skill-search-input');
		expect(native).toBeTruthy();
		native!.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		);

		expect(searchSkills).toHaveBeenCalledWith('xy', { limit: 20, mode: 'skills' });
	});
});
