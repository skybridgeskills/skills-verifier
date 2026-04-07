import type { AppContext } from './app-context.js';
import { parseBaseEnv } from './app-env.js';

/**
 * Build server AppContext from SvelteKit `$env/dynamic/private` (or test env).
 */
export async function buildAppContext(env: Record<string, unknown>): Promise<AppContext> {
	const { CONTEXT } = parseBaseEnv(env);

	switch (CONTEXT) {
		case 'aws': {
			const { AwsAppContext } = await import('./aws-app-context.js');
			return AwsAppContext(env);
		}
		case 'dev': {
			const { DevAppContext } = await import('./dev-app-context.js');
			return DevAppContext(env);
		}
		case 'test': {
			const { TestAppContext } = await import('./test-app-context.js');
			return TestAppContext(env);
		}
		default: {
			const _never: never = CONTEXT;
			throw new Error(`Unknown CONTEXT: ${_never}`);
		}
	}
}
