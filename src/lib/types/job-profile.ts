/**
 * Type definitions for job profiles, frameworks, and skills.
 * Based on CTDL/CTDL-ASN JSON-LD structures from Credential Engine Registry.
 */

/**
 * Skill represents a competency/skill from a framework.
 * Aligned with storage {@link SkillResource} (ctid, required text).
 */
export interface Skill {
	/** URL to the skill JSON-LD resource */
	url: string;
	/** Competency label (short name) if available */
	label?: string;
	/** Competency text (description) */
	text: string;
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
