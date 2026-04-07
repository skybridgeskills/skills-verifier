import { describe, it, expect } from 'vitest';

import { appContext } from './app-context.js';
import { DevAppContext } from './dev-app-context.js';
import { SkillSearchQuery } from './services/skill-search/skill-search-service.js';
import { TestAppContext } from './test-app-context.js';
import { runInContext } from './util/provider/provider-ctx.js';

describe('App Context Integration', () => {
	it('works with FakeAppContext', async () => {
		const context = await TestAppContext({});

		runInContext(context, () => {
			const ctx = appContext();

			// Test time service
			const time1 = ctx.timeService.dateNowMs();
			const time2 = ctx.timeService.dateNowMs();
			expect(time2).toBeGreaterThan(time1);

			// Test ID service
			const id1 = ctx.idService.secureUid();
			const id2 = ctx.idService.secureUid();
			expect(id1).not.toBe(id2);

			// Test framework client exists
			expect(ctx.frameworkClient).toBeDefined();
			expect(ctx.database).toBeDefined();
			expect(ctx.database.$type).toBe('memory');

			expect(ctx.skillSearchService).toBeDefined();
		});
	});

	it('fake skill search returns results', async () => {
		const context = await TestAppContext({});
		await runInContext(context, async () => {
			const results = await appContext().skillSearchService.search(
				SkillSearchQuery({ query: 'React' })
			);
			expect(results.length).toBeGreaterThan(0);
		});
	});

	it('works with RealAppContext', async () => {
		const context = await DevAppContext({});

		runInContext(context, () => {
			const ctx = appContext();

			// Test time service
			const time = ctx.timeService.dateNowMs();
			expect(time).toBeGreaterThan(0);

			// Test ID service
			const id = ctx.idService.secureUid();
			expect(id.length).toBeGreaterThan(0);

			// Test framework client exists
			expect(ctx.frameworkClient).toBeDefined();
			expect(ctx.database).toBeDefined();
		});
	});
});
