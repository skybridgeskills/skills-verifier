import { logServiceInitialized } from '../../util/log-service-initialized.js';

import { FakeSkillSearchService } from './fake-skill-search-service.js';
import type { SkillSearchServiceCtx } from './skill-search-service.js';

export function provideFakeSkillSearchService(): SkillSearchServiceCtx {
	const skillSearchService = FakeSkillSearchService();
	logServiceInitialized('skillSearchService', 'fake');
	return { skillSearchService };
}
