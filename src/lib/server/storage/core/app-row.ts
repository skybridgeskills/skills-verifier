import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

/**
 * Base schema for all database row objects (DynamoDB single-table design).
 * Contains the common key fields used across all entities.
 */
export const AppRow = ZodFactory(
	z.object({
		PK: z.string(),
		SK: z.string(),
		GSI1PK: z.string(),
		GSI1SK: z.string()
	})
);

/**
 * Base type for all database row objects.
 */
export type AppRow = ReturnType<typeof AppRow>;

/**
 * Common key fields for all row schemas.
 * Use this to pick/extend when building specific row schemas.
 */
export const AppRowFields = {
	PK: AppRow.schema.shape.PK,
	SK: AppRow.schema.shape.SK,
	GSI1PK: AppRow.schema.shape.GSI1PK,
	GSI1SK: AppRow.schema.shape.GSI1SK
};
