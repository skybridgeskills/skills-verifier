/**
 * Type definitions for job profiles, frameworks, and skills.
 * Based on CTDL/CTDL-ASN JSON-LD structures from Credential Engine Registry.
 */

/**
 * Skill represents a competency/skill from a framework.
 * Aligned with storage {@link SkillResource} (ctid; text normalized on save).
 */
export interface Skill {
	/** URL to the skill JSON-LD resource */
	url: string;
	/** Competency label (short name) if available */
	label?: string;
	/** Competency description when distinct from the label (e.g. Credential Engine description). */
	text?: string;
	/** Credential Transparency Description Language ID */
	ctid: string;
	/** URL to the framework that the skill belongs to */
	frameworkUrl?: string;
}

/**
 * Framework represents a competency framework from Credential Engine Registry.
 */
export interface Framework {
	/** Framework name */
	name: string;
	/** Organization that published the framework */
	organization: string;
	/** URL to the framework JSON-LD resource */
	url: string;
	/** Credential Transparency Description Language ID */
	ctid: string;
}

/**
 * JobProfile represents a job profile with selected frameworks and skills.
 */
export interface JobProfile {
	/** Job title/name */
	name: string;
	/** One-sentence job description */
	description: string;
	/** Company name */
	company: string;
	/** Optional framework metadata (hints, provenance); not required to create a job */
	frameworks?: Framework[];
	/** Selected skills for this job */
	skills: Skill[];
}

/**
 * Language-specific string value from JSON-LD.
 * Example: { "en-us": "Health Information Management" }
 */
export interface LanguageString {
	[key: string]: string;
}

/**
 * JSON-LD response structure for a framework.
 * Based on ceasn:CompetencyFramework type.
 */
export interface FrameworkJsonLd {
	'@id': string;
	'@type': string;
	'@context': string;
	'ceterms:ctid': string;
	'ceasn:name': LanguageString;
	'ceasn:publisherName'?: LanguageString;
	'ceasn:description'?: LanguageString;
	'ceasn:hasTopChild': string[];
	'ceasn:creator'?: string[];
	'ceasn:publisher'?: string[];
	'ceasn:inLanguage'?: string[];
}

/**
 * JSON-LD response structure for a skill/competency.
 * Based on ceasn:Competency type.
 */
export interface SkillJsonLd {
	'@id': string;
	'@type': string;
	'@context': string;
	'ceterms:ctid': string;
	'ceasn:competencyLabel'?: LanguageString;
	'ceasn:competencyText'?: LanguageString;
	'ceasn:isPartOf'?: string;
	'ceasn:isTopChildOf'?: string;
	'ceasn:creator'?: string[];
	'ceasn:inLanguage'?: string[];
}

/**
 * CTDL (Credential Transparency Description Language) aligned types.
 * These mirror structures from Credential Engine Registry JSON-LD responses.
 */

/**
 * CTDL Types that act as skill containers.
 * Maps to ceterms:Job, ceterms:Occupation, ceterms:WorkRole, ceterms:Task
 */
export type CtdlSkillContainerType = 'Job' | 'Occupation' | 'WorkRole' | 'Task';

/**
 * CTDL-aligned skill container (Job, Occupation, WorkRole, Task).
 * Mirrors structure from ceterms:Occupation, ceterms:Job, etc.
 */
export interface CtdlSkillContainer {
	'@id': string;
	'@type': CtdlSkillContainerType;
	'ceterms:ctid': string;
	'ceterms:name': LanguageString;
	'ceterms:description'?: LanguageString;
	/** Skill relationship properties (arrays of competency URLs) */
	'ceasn:skillEmbodied'?: string[];
	'ceasn:knowledgeEmbodied'?: string[];
	'ceasn:abilityEmbodied'?: string[];
	/** UI-computed field: total skills across all three properties */
	skillCount: number;
	/** UI-computed field: flattened unique URLs for batch fetching */
	skillUrls: string[];
}

/**
 * CTDL-aligned competency framework.
 * Mirrors ceasn:CompetencyFramework structure.
 */
export interface CtdlCompetencyFramework {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	'ceasn:name': LanguageString;
	'ceasn:description'?: LanguageString;
	'ceasn:publisherName'?: LanguageString;
	/** URLs to competencies in the framework */
	'ceasn:hasTopChild': string[];
	/** UI-computed field: number of competencies */
	skillCount: number;
	/** UI-computed field: competency URLs */
	skillUrls: string[];
}

/**
 * Simplified search result for CTDL skill containers.
 */
export interface CtdlSkillContainerSearchResult {
	'@id': string;
	'@type': CtdlSkillContainerType;
	'ceterms:ctid': string;
	/** Extracted from ceterms:name['en-US'] */
	name: string;
	/** Extracted from ceterms:description['en-US'] */
	description?: string;
	/** Pre-computed from embodied arrays */
	skillCount: number;
}

/**
 * Simplified search result for CTDL competency frameworks.
 */
export interface CtdlFrameworkSearchResult {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	/** Extracted from ceasn:name['en-US'] */
	name: string;
	/** Extracted from ceasn:description['en-US'] */
	description?: string;
	/** Extracted from ceasn:publisherName['en-US'] */
	publisher?: string;
	/** Pre-computed from hasTopChild length */
	skillCount: number;
}

/**
 * Skill with CTDL source tracking.
 */
export interface SkillWithSource extends Skill {
	sourceCtdlContainer?: {
		name: string;
		'@id': string;
		'@type': CtdlSkillContainerType;
	};
	sourceCtdlFramework?: {
		name: string;
		'@id': string;
	};
}

/**
 * Quick pick item for the quick picks component.
 */
export interface QuickPickItem {
	type: 'Skill' | CtdlSkillContainerType | 'Framework';
	entity: Skill | CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
	/** Pre-fetched skills for containers/frameworks */
	skills?: Skill[];
}
