import { expect, test } from '@playwright/test';

// The `?embed=learncard-partner-connect` variant swaps the QR for a "Request from LearnCard"
// button (click-to-start: the exchange starts when the button is pressed). Driving the real
// cross-origin partner-connect SDK would require prod test hooks, so the SDK request/relay flow is
// covered by ExchangePanel.svelte.spec.ts. Here we validate the embed plumbing end-to-end: the
// query param flips the panel to the request button and never shows the QR.
test('learncard embed variant shows the request button and hides the QR', async ({ page }) => {
	await page.goto('/jobs');
	await page.getByRole('link', { name: 'Senior Engineer' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+$/);

	await page.getByRole('button', { name: 'Create a skills match' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+\/match\/[^/]+/);

	// Re-open the same match with the embed variant active.
	const url = new URL(page.url());
	url.searchParams.set('embed', 'learncard-partner-connect');
	await page.goto(url.toString());

	// The variant shows the LearnCard request button and never a QR. ("Open another wallet" and the
	// interaction URL appear only after the exchange is started by pressing the button.)
	await expect(page.getByTestId('learncard-request-cta')).toBeVisible();
	await expect(page.getByTestId('exchange-qr')).toHaveCount(0);
	await expect(page.getByTestId('verify-cta')).toHaveCount(0);
});

// The embed intent is remembered for the session: navigating to another match WITHOUT the query
// param still shows the LearnCard request button (not the QR) within the same tab.
test('learncard embed preference persists across in-session navigation', async ({ page }) => {
	await page.goto('/jobs');
	await page.getByRole('link', { name: 'Senior Engineer' }).click();
	await page.getByRole('button', { name: 'Create a skills match' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+\/match\/[^/]+/);

	// First match: launch with the embed param so the session remembers the intent.
	const embedUrl = new URL(page.url());
	embedUrl.searchParams.set('embed', 'learncard-partner-connect');
	await page.goto(embedUrl.toString());
	await expect(page.getByTestId('learncard-request-cta')).toBeVisible();

	// Create a second match and open it WITHOUT the embed param — it should still be embed mode.
	await page.getByRole('link', { name: /Back to Senior Engineer/i }).click();
	await page.getByRole('button', { name: 'Create a skills match' }).click();
	await expect(page).toHaveURL(/\/jobs\/[^/]+\/match\/[^/]+/);

	await expect(page.getByTestId('learncard-request-cta')).toBeVisible();
	await expect(page.getByTestId('exchange-qr')).toHaveCount(0);
});
