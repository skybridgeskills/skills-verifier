import { expect, test } from '@playwright/test';

import { FAKE_VERIFIED_CREDENTIALS } from '../src/lib/server/domain/verification/fake-verification-exchange.js';

// The fake exchange completes after a fixed poll count and the UI polls every ~2500ms,
// so allow generous waits for the verified state to appear.
const VERIFY_TIMEOUT = 20_000;

const [firstCredential] = FAKE_VERIFIED_CREDENTIALS;

test('full skills-match flow: create → verify (fake) → assign + narrative → save → reload persists', async ({
	page
}) => {
	// 1. Open a job WITH skills. The seed (CONTEXT=test + SEED_MEMORY_DATABASE) creates
	//    "Senior Engineer" with a skill. Navigate via the jobs list for determinism.
	await page.goto('/jobs');
	await page.getByRole('link', { name: 'Senior Engineer' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+$/);

	// 2. Create the match.
	await page.getByRole('button', { name: 'Create a skills match' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+\/match\/[^/]+$/);

	// 3. Trigger verify; QR + same-device link appear.
	await page.getByTestId('verify-cta').click();
	await expect(page.getByTestId('exchange-qr')).toBeVisible();
	await expect(page.getByTestId('exchange-same-device-link')).toBeVisible();

	// 4. Fake auto-completes after its poll threshold → verified credentials appear.
	//    Assert the fixture credential name + issuer (proves CONTEXT=test/Fake is active).
	const credentialCard = page.getByTestId('credential-card').first();
	await expect(credentialCard).toBeVisible({ timeout: VERIFY_TIMEOUT });
	await expect(credentialCard).toContainText(firstCredential.name);
	await expect(credentialCard).toContainText(firstCredential.issuer);
	await expect(page.getByTestId('match-board')).toBeVisible();

	// 5. Assign the credential to a skill via the ACCESSIBLE FALLBACK control (not native DnD).
	const select = credentialCard.getByTestId('assign-skill-select');
	await select.selectOption({ index: 1 }); // index 0 is the disabled "Assign to skill…" placeholder
	await credentialCard.getByTestId('assign-skill-apply').click();

	// The assignment renders a narrative textarea in the skill column.
	const narrative = page.getByTestId('assignment-narrative').first();
	await expect(narrative).toBeVisible();

	// 6. Enter a narrative.
	const narrativeText = 'This credential directly demonstrates the required skill.';
	await narrative.fill(narrativeText);

	// 7. Save; expect a success indicator.
	await page.getByTestId('save-assignments').click();
	await expect(page.getByTestId('save-status')).toContainText('Assignments saved');

	// 8. Reload; the assignment + narrative persist (MemoryDatabase survives in the preview process).
	await page.reload();
	await expect(page.getByTestId('match-board')).toBeVisible({ timeout: VERIFY_TIMEOUT });
	const persistedNarrative = page.getByTestId('assignment-narrative').first();
	await expect(persistedNarrative).toBeVisible();
	await expect(persistedNarrative).toHaveValue(narrativeText);
});
