import { FakeSkillSearchService } from './fake-skill-search-service.js';
import type { SkillSearchServiceCtx } from './skill-search-service.js';

export function provideFakeSkillSearchService(): SkillSearchServiceCtx {
	return { skillSearchService: FakeSkillSearchService() };
}
