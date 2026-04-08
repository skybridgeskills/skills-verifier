import type {
	CtdlCompetencyFramework,
	CtdlFrameworkSearchResult,
	CtdlSkillContainer,
	CtdlSkillContainerSearchResult,
	Skill
} from '$lib/types/job-profile';

export type LoadCtdlDetailFn = (
	entityResult: CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult
) => Promise<{
	entity: CtdlSkillContainer | CtdlCompetencyFramework;
	skills: Skill[];
}>;
