# Phase 1: Type Definitions and Client Updates

## Scope

Add CTDL-aligned type definitions and extend the skill search client to support multi-mode search.

## Implementation

### 1. Update `src/lib/types/job-profile.ts`

Add CTDL-aligned types for skill containers and frameworks:

```typescript
/**
 * CTDL (Credential Transparency Description Language) aligned types.
 * These mirror structures from Credential Engine Registry JSON-LD responses.
 */

// CTDL Types that act as skill containers
// Maps to ceterms:Job, ceterms:Occupation, ceterms:WorkRole, ceterms:Task
type CtdlSkillContainerType = 'Job' | 'Occupation' | 'WorkRole' | 'Task';

// ceterms:CompetencyFramework
type CtdlFrameworkType = 'CompetencyFramework';

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
	// Skill relationship properties (arrays of competency URLs)
	'ceasn:skillEmbodied'?: string[];
	'ceasn:knowledgeEmbodied'?: string[];
	'ceasn:abilityEmbodied'?: string[];
	// UI-computed fields
	skillCount: number;
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
	'ceasn:hasTopChild': string[];
	// UI-computed fields
	skillCount: number;
	skillUrls: string[];
}

/**
 * Simplified search result for CTDL skill containers.
 */
export interface CtdlSkillContainerSearchResult {
	'@id': string;
	'@type': CtdlSkillContainerType;
	'ceterms:ctid': string;
	name: string;
	description?: string;
	skillCount: number;
}

/**
 * Simplified search result for CTDL competency frameworks.
 */
export interface CtdlFrameworkSearchResult {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	name: string;
	description?: string;
	publisher?: string;
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
	skills?: Skill[]; // Pre-fetched skills for containers/frameworks
}
```

### 2. Update `src/lib/clients/skill-search-client.ts`

Extend with mode parameter and new functions:

```typescript
// Add mode type
export type SearchMode = 'skills' | 'containers' | 'frameworks';

// Update searchSkills signature
export async function searchSkills(
	query: string,
	options?: {
		limit?: number;
		mode?: SearchMode;
	}
): Promise<Skill[] | CtdlSkillContainerSearchResult[] | CtdlFrameworkSearchResult[]> {
	const { limit = 20, mode = 'skills' } = options ?? {};
	// ... include mode in request body
}

// Add batch skill fetch
export async function fetchSkillsByUrls(urls: string[]): Promise<Skill[]> {
	const response = await fetch('/api/skills/batch', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ urls })
	});
	// ... error handling and mapping
}

// Add single resource fetch
export async function fetchCtdlResource(
	url: string
): Promise<CtdlSkillContainer | CtdlCompetencyFramework> {
	const response = await fetch(`/api/resource?url=${encodeURIComponent(url)}`);
	// ... error handling
}

// Helper to compute skill URLs from container
export function extractSkillUrls(container: CtdlSkillContainer): string[] {
	const skillUrls = container['ceasn:skillEmbodied'] ?? [];
	const knowledgeUrls = container['ceasn:knowledgeEmbodied'] ?? [];
	const abilityUrls = container['ceasn:abilityEmbodied'] ?? [];
	// Combine and deduplicate
	return [...new Set([...skillUrls, ...knowledgeUrls, ...abilityUrls])];
}
```

### 3. Create sample data for quick picks

Create `src/lib/config/sample-entities.ts` with pre-loaded CTDL data:

```typescript
import type { QuickPickItem } from '$lib/types/job-profile';

// From the example data provided
export const SAMPLE_OCCUPATIONS: QuickPickItem[] = [
	{
		type: 'Occupation',
		entity: {
			'@id':
				'https://credentialengineregistry.org/resources/ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
			name: 'Acute Care Nurses',
			description: 'Provide advanced nursing care for patients with acute conditions...',
			skillCount: 30 // Pre-computed from skillEmbodied + knowledgeEmbodied + abilityEmbodied
		}
	}
	// More from example data...
];

export const SAMPLE_JOBS: QuickPickItem[] = [
	// Job examples...
];

export const QUICK_PICKS: QuickPickItem[] = [
	...SAMPLE_OCCUPATIONS,
	...SAMPLE_JOBS
	// Include some existing skills...
];
```

## Style Conventions

- Use CTDL property names in interfaces (`ceterms:ctid`, `ceasn:skillEmbodied`) to stay aligned with API
- Provide UI-friendly aliases (e.g., `name` extracted from `ceterms:name['en-US']`)
- Helper functions go at bottom of file
- Export types explicitly

## Validate

```bash
pnpm turbo check
```

Ensure no TypeScript errors in new types and client functions.
