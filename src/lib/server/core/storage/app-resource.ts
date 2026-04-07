import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

/**
 * Base schema for all domain resources (DTO layer).
 * Following the Google API Design Guide pattern for Resource naming.
 */
export const AppResource = ZodFactory(
	z.object({
		id: z.string(),
		createdAt: z.date()
	})
);

/**
 * Base type for all domain resources.
 */
export type AppResource = ReturnType<typeof AppResource>;

/**
 * Common fields for all domain resources.
 * Use this to pick/extend when building specific resource schemas.
 */
export const AppResourceFields = {
	id: AppResource.schema.shape.id,
	createdAt: AppResource.schema.shape.createdAt
};
