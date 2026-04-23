import { providerCtx, providerCtxSafe } from '../util/provider/provider-ctx.js';

import { HealthCheckSym, type HealthCheck } from './health-check.js';
import { HealthRegistry as createHealthRegistry } from './health-registry.js';
import type { HealthRegistry } from './health-registry.js';

export interface HealthRegistryCtx {
	healthRegistry: HealthRegistry;
}

export function healthRegistry(): HealthRegistry {
	return providerCtx<HealthRegistryCtx>().healthRegistry;
}

export function healthRegistrySafe(): HealthRegistry | undefined {
	return providerCtxSafe<HealthRegistryCtx>().healthRegistry;
}

export function provideHealthRegistry(ctx: object): HealthRegistryCtx {
	const registry = createHealthRegistry();
	for (const value of Object.values(ctx)) {
		const check = (value as { [HealthCheckSym]?: HealthCheck } | null | undefined)?.[
			HealthCheckSym
		];
		if (check != null) {
			registry.register(check);
		}
	}
	return { healthRegistry: registry };
}
