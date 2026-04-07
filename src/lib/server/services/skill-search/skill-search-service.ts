import { z } from 'zod';

import { providerCtx } from '$lib/server/util/provider/provider-ctx.js';
import { ZodFactory } from '$lib/server/util/zod-factory.js';

export const SkillSearchQuery = ZodFactory(
	z.object({
		query: z.string().min(1).max(200),
		limit: z.number().int().min(1).max(100).default(20)
	})
);
export type SkillSearchQuery = ReturnType<typeof SkillSearchQuery>;

export const SkillSearchResult = ZodFactory(
	z.object({
		id: z.string(),
		name: z.string(),
		uri: z.string().url(),
		ctid: z.string().optional(),
		description: z.string().optional()
	})
);
export type SkillSearchResult = ReturnType<typeof SkillSearchResult>;

export interface SkillSearchService {
	search(query: SkillSearchQuery): Promise<SkillSearchResult[]>;
}

export interface SkillSearchServiceCtx {
	skillSearchService: SkillSearchService;
}

/** Skill search from the current app context (see hooks / tests). */
export function skillSearchService(): SkillSearchService {
	return providerCtx<SkillSearchServiceCtx>().skillSearchService;
}
