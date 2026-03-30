import { describe, it, expect } from 'vitest';

import { runInContext, appContext } from './app-context.js';
import { DevAppContext } from './dev-app-context.js';
import { TestAppContext } from './test-app-context.js';

describe('App Context Integration', () => {
	it('works with FakeAppContext', async () => {
		const context = await TestAppContext();

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
		});
	});

	it('works with RealAppContext', async () => {
		const context = await DevAppContext();

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
		});
	});
});
