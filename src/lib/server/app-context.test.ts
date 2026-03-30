import { describe, it, expect } from 'vitest';

import { FakeFrameworkClient } from '$lib/clients/framework-client/fake-framework-client.js';

import { appContext } from './app-context.js';
import type { AppContext } from './app-context.js';
import { FakeIdService, FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { FakeTimeService, FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { runInContext, runWithExtraContext } from './util/provider/provider-ctx.js';

describe('app-context', () => {
	function createTestContext(): AppContext {
		return {
			...FakeTimeServiceCtx(),
			...FakeIdServiceCtx(),
			frameworkClient: new FakeFrameworkClient()
		};
	}

	describe('runInContext', () => {
		it('makes context available via appContext()', () => {
			const context = createTestContext();

			runInContext(context, () => {
				const ctx = appContext();
				expect(ctx).toBeDefined();
				expect(ctx.timeService).toBe(context.timeService);
				expect(ctx.idService).toBe(context.idService);
				expect(ctx.frameworkClient).toBe(context.frameworkClient);
			});
		});

		it('throws if appContext() called outside of runInContext', () => {
			expect(() => {
				appContext();
			}).toThrow('No app context present');
		});

		it('returns the result of the function', () => {
			const context = createTestContext();
			const result = runInContext(context, () => {
				return 42;
			});

			expect(result).toBe(42);
		});

		it('handles nested contexts', () => {
			const context1 = createTestContext();
			const context2 = createTestContext();

			runInContext(context1, () => {
				runInContext(context2, () => {
					const ctx2 = appContext();
					expect(ctx2.timeService).toBe(context2.timeService);
					expect(ctx2.idService).toBe(context2.idService);
					expect(ctx2.frameworkClient).toBe(context2.frameworkClient);
				});

				const ctx1Again = appContext();
				expect(ctx1Again.timeService).toBe(context1.timeService);
				expect(ctx1Again.idService).toBe(context1.idService);
				expect(ctx1Again.frameworkClient).toBe(context1.frameworkClient);
			});
		});
	});

	describe('runWithExtraContext', () => {
		it('extends existing context', () => {
			const baseContext = createTestContext();
			const newTimeService = FakeTimeService();

			runInContext(baseContext, () => {
				runWithExtraContext({ timeService: newTimeService }, () => {
					const ctx = appContext();
					expect(ctx.timeService).toBe(newTimeService);
					expect(ctx.idService).toBe(baseContext.idService);
					expect(ctx.frameworkClient).toBe(baseContext.frameworkClient);
				});
			});
		});

		it('creates new context if none exists', () => {
			const newTimeService = FakeTimeService();
			const newIdService = FakeIdService();

			runWithExtraContext(
				{
					timeService: newTimeService,
					idService: newIdService
				},
				() => {
					const ctx = appContext();
					expect(ctx.timeService).toBe(newTimeService);
					expect(ctx.idService).toBe(newIdService);
				}
			);
		});
	});
});
