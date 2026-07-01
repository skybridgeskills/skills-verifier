import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build:svelte && npm run preview',
		port: 4173,
		// CONTEXT is read at runtime via `$env/dynamic/private` (build-app-context.ts), so a
		// runtime env on `preview` activates the Fake verification exchange + MemoryDatabase.
		// SEED_MEMORY_DATABASE ensures a deterministic job-with-skills exists.
		env: { ...process.env, CONTEXT: 'test', SEED_MEMORY_DATABASE: 'true' }
	},
	testDir: 'e2e'
});
