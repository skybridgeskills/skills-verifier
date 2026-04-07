import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

/**
 * Deployment context: explicit `CONTEXT` env (see docs/deployment.md).
 */
export const AppContextKind = ZodFactory(z.enum(['aws', 'dev', 'test']));
export type AppContextKind = ReturnType<typeof AppContextKind>;

const BaseEnvSchema = z.object({
	CONTEXT: z.preprocess((v) => (v === undefined || v === '' ? 'dev' : v), AppContextKind.schema)
});

/**
 * Read which app context to build. Defaults to `dev` when unset or empty.
 */
export function parseBaseEnv(env: Record<string, unknown>): { CONTEXT: AppContextKind } {
	const { CONTEXT } = BaseEnvSchema.parse({ CONTEXT: env.CONTEXT });
	return { CONTEXT };
}
