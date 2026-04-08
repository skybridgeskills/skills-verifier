# Job Search Redesign - Design Document

## Scope of Work

Redesign the job creation experience in skills-verifier with:

1. Enhanced Quick Picks supporting multiple entity types (Skills, Jobs, Occupations, etc.) with type labels
2. Reorganized page layout - job form first, selected skills below, search in sidebar (desktop) / dialog (mobile)
3. Multi-mode search interface with tabs for Individual Skills, Jobs & Occupations, and Skill Frameworks
4. Drill-down skill selection view when selecting a container entity
5. Comprehensive Storybook coverage for all component variations

## File Structure

```
src/lib/
├── components/
│   ├── job-profile-form/
│   │   └── JobProfileForm.svelte       # EXISTING (embedded mode for sidebar)
│   ├── selected-skills-column/
│   │   └── SelectedSkillsColumn.svelte # EXISTING (may need minor updates)
│   ├── skill-search/
│   │   ├── SkillSearch.svelte          # UPDATE - add mode tabs, drill-down
│   │   ├── SkillSearchResultItem.svelte # UPDATE - add type badge, skill count
│   │   ├── index.ts                    # EXISTING (update exports)
│   │   └── *.stories.svelte            # UPDATE stories
│   ├── quick-picks/
│   │   ├── QuickPicks.svelte           # NEW - replaces QuickSkillPicks
│   │   ├── QuickPickItem.svelte        # NEW - single tag with type label
│   │   ├── index.ts                    # NEW
│   │   └── *.stories.svelte            # NEW
│   ├── skill-item/
│   │   ├── SkillItem.svelte            # EXISTING (may add source indicator)
│   │   └── *.stories.svelte            # UPDATE
│   ├── ctdl-skill-container-view/
│   │   ├── CtdlSkillContainerView.svelte # NEW - drill-down view for CTDL containers
│   │   ├── CtdlEntityHeader.svelte       # NEW - CTDL entity summary with back
│   │   ├── index.ts                      # NEW
│   │   └── *.stories.svelte              # NEW
│   ├── entity-result-item/
│   │   ├── EntityResultItem.svelte     # NEW - Job/Occ/Framework result row
│   │   ├── index.ts                    # NEW
│   │   └── *.stories.svelte            # NEW
│   └── ui/
│       └── dialog/                     # EXISTING (for mobile search dialog)
├── types/
│   └── job-profile.ts                  # UPDATE - add Container, Framework types
└── clients/
    └── skill-search-client.ts         # UPDATE - add mode param, new fns

src/routes/jobs/create/
├── +page.svelte                       # UPDATE - new layout
└── +page.server.ts                    # EXISTING
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CreateJobPage (Orchestrator)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────┐  ┌─────────────────────────┐ │
│  │         Job Info Section            │  │     Search Sidebar      │ │
│  │  ┌──────────────────────────────┐  │  │  (Desktop: Right Col)   │ │
│  │  │   JobProfileForm (embedded)   │  │  │  (Mobile: Dialog)     │ │
│  │  └──────────────────────────────┘  │  │                         │ │
│  │                                    │  │  ┌───────────────────┐  │ │
│  │  ┌──────────────────────────────┐  │  │  │   QuickPicks       │  │ │
│  │  │  SelectedSkillsColumn       │  │  │  │   (multi-type)     │  │ │
│  │  │  (shows selected w/ source)    │  │  │  └───────────────────┘  │ │
│  │  └──────────────────────────────┘  │  │                         │ │
│  │                                    │  │  ┌───────────────────┐  │ │
│  │  ┌──────────────────────────────┐  │  │  │   SkillSearch      │  │ │
│  │  │  [Save Job Button]           │  │  │  │   (mode tabs)      │  │ │
│  │  └──────────────────────────────┘  │  │  │                    │  │ │
│  └────────────────────────────────────┘  │  │  │  ┌─────────────┐   │  │ │
│                                          │  │  │  │Tab: Skills  │   │  │ │
│                                          │  │  │  │Tab: Jobs    │   │  │ │
│                                          │  │  │  │Tab: Framework│   │  │ │
│                                          │  │  │  └─────────────┘   │  │ │
│                                          │  │  │                     │  │ │
│                                          │  │  │  ┌─────────────┐     │  │ │
│                                          │  │  │  │Search Input │     │  │ │
│                                          │  │  │  └─────────────┘     │  │ │
│                                          │  │  │                     │  │ │
│                                          │  │  │  ┌─────────────┐     │  │ │
│                                          │  │  │  │Results List │─────┼──┼─┼──────┐
│                                          │  │  │  └─────────────┘     │  │ │      │
│                                          │  │  └───────────────────┘  │ │      │
│                                          │  └─────────────────────────┘ │      │
│                                          │                              │      │
│                                          │  Click container result:    │      │
│                                          │                              │      │
│                                          │  ┌──────────────────────┐    │      │
│                                          │  │ CtdlSkillContainerView│◄───┘      │
│                                          │  │   (drill-down)        │           │
│                                          │  │ ┌──────────────────┐  │           │
│                                          │  │ │ Back Button      │  │           │
│                                          │  │ │ CTDL Entity Info │  │           │
│                                          │  │ └──────────────────┘  │           │
│                                          │  │ ┌──────────────────┐  │           │
│                                          │  │ │ Skill List       │  │           │
│                                          │  │ │ (from entity)     │  │           │
│                                          │  │ └──────────────────┘  │           │
│                                          │  └──────────────────────┘              │
│                                          └─────────────────────────────────────┘
```

## Data Flow

```
1. User types keyword in search input
   ↓
2. SkillSearch.svelte detects current mode tab
   ↓
3. Calls searchSkills(query, { mode: 'skills'|'containers'|'frameworks' })
   ↓
4. API returns results based on mode:
   - skills: Skill[] (url, label, text, ctid)
   - containers: CtdlSkillContainerSearchResult[] (@id, @type, ceterms:ctid, name, skillCount)
   - frameworks: CtdlFrameworkSearchResult[] (@id, @type, ceterms:ctid, name, skillCount)
   ↓
5. Results displayed via EntityResultItem or SkillSearchResultItem
   ↓
6. User clicks CTDL entity result (CtdlSkillContainer or CtdlCompetencyFramework)
   ↓
7. CtdlSkillContainerView.svelte fetches full CTDL entity + batch fetches competencies
   ↓
8. User adds individual skills or "Add All"
   ↓
9. Skills flow back to CreateJobPage via onToggle callback
   ↓
10. SelectedSkillsColumn updates with new skills (showing CTDL source)
```

## Component Responsibilities

### CreateJobPage.svelte (Updated)

- **State**: `selectedSkills: Skill[]`, `searchDialogOpen: boolean` (mobile)
- **Layout**: Left column = job form + selected skills, Right column = search (desktop)
- **Callbacks**: Passes to children for skill add/remove
- **Mobile**: Wraps search in Dialog

### QuickPicks.svelte (New)

- **Props**: `picks: QuickPickItem[]`, `selectedUrls: string[]`, `onToggle(skill: Skill)`
- **Display**: Tags with type label badge (e.g., "Occupation: Acute Care Nurse")
- **Types**: Skills, Jobs, Occupations pre-populated with sample data

### QuickPickItem.svelte (New)

- **Props**: `pick: QuickPickItem`, `isSelected: boolean`, `onClick()`
- **Behavior**: Clicking adds all skills from that entity to selected skills
- **Display**: Horizontal tag with small type badge + name

### SkillSearch.svelte (Updated)

- **State**: `mode: 'skills'|'containers'|'frameworks'`, `drillDownEntity: Container|null`
- **Tabs**: Three mode tabs at top
- **Conditional Render**:
  - Normal mode: Search input + results list
  - Drill-down mode: Renders ContainerSkillView
- **Props**: `selectedUrls: string[]`, `onToggle(skill, add: boolean)`, `onContainerSelect(container)`

### EntityResultItem.svelte (New)

- **Props**: `entity: CtdlSkillContainerSearchResult|CtdlFrameworkSearchResult`, `onSelect()`
- **Display**: Name, CTDL type badge (Job, Occupation, etc.), skill count, description snippet
- **Behavior**: Click enters drill-down view

### CtdlSkillContainerView.svelte (New)

- **Props**: `container: CtdlSkillContainer`, `selectedUrls: string[]`, `onBack()`, `onToggle(skill, add)`
- **Behavior**:
  - On mount: Fetch full CTDL entity + batch fetch associated competencies
  - Shows container header + back button
  - Lists skills with add/remove toggles
  - "Add All" button to bulk add

### SkillSearchResultItem.svelte (Updated)

- **Props**: `skill: Skill`, `isSelected: boolean`, `onToggle()`, `source?: string`
- **Display**: Title, description (if different), CTID, selected state
- **Enhancement**: Optional source indicator (e.g., "from Acute Care Nurse")

### SelectedSkillsColumn.svelte (Updated)

- **Enhancement**: Show skill source if it came from a container (e.g., small text "Added from Occupation: Acute Care Nurse")

## Style Conventions

From `docs/style/` and `AGENTS.md`:

- **Factory functions** over classes — Use `function MyService()` not `class MyService`
- **ZodFactory** for schemas — `export const Skill = ZodFactory(z.object({...})); export type Skill = ReturnType<typeof Skill>;`
- **Organize by domain**, not by type — Keep related components together
- **Order by abstraction** — High-level exports first, helpers later
- **File size** — Keep under ~200 lines, extract helpers early
- **Co-locate tests** — `<file>.test.ts` next to source
- **Import order**: External deps → `$lib/` → Relative
- **Naming**: Actions camelCase (`doSomething`), creators PascalCase (`SkillResult`)
- **TSDoc**: Add concise examples for public APIs

## Type Additions (CTDL-Aligned)

Based on Credential Transparency Description Language (CTDL) from Credential Engine Registry:

```typescript
// CTDL Types that act as skill containers
// ceterms:Job, ceterms:Occupation, ceterms:WorkRole, ceterms:Task
type CtdlSkillContainerType = 'Job' | 'Occupation' | 'WorkRole' | 'Task';

// ceterms:CompetencyFramework
type CtdlFrameworkType = 'CompetencyFramework';

// ceterms:Competency (skill)
type CtdlSkillType = 'Competency' | 'Skill';

// CTDL-aligned skill container (Job, Occupation, WorkRole, Task)
// Mirrors structure from ceterms:Occupation, ceterms:Job, etc.
export interface CtdlSkillContainer {
	'@id': string; // Resource URL
	'@type': CtdlSkillContainerType; // CTDL type name
	'ceterms:ctid': string; // Credential Transparency ID
	'ceterms:name': LanguageString; // e.g., { "en-US": "Acute Care Nurses" }
	'ceterms:description'?: LanguageString;
	// Skill relationships (arrays of competency URLs)
	'ceasn:skillEmbodied'?: string[];
	'ceasn:knowledgeEmbodied'?: string[];
	'ceasn:abilityEmbodied'?: string[];
	// UI-computed fields
	skillCount: number; // Total skills across all three properties
	skillUrls: string[]; // Flattened unique URLs for batch fetching
}

// CTDL-aligned competency framework
// Mirrors ceasn:CompetencyFramework structure
export interface CtdlCompetencyFramework {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	'ceasn:name': LanguageString;
	'ceasn:description'?: LanguageString;
	'ceasn:publisherName'?: LanguageString;
	'ceasn:hasTopChild': string[]; // URLs to competencies in framework
	// UI-computed fields
	skillCount: number;
	skillUrls: string[];
}

// Search result variants (simplified for UI)
export interface CtdlSkillContainerSearchResult {
	'@id': string;
	'@type': CtdlSkillContainerType;
	'ceterms:ctid': string;
	name: string; // Extracted from ceterms:name['en-US']
	description?: string; // Extracted from ceterms:description['en-US']
	skillCount: number; // Pre-computed from embodied arrays
}

export interface CtdlFrameworkSearchResult {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	name: string; // Extracted from ceasn:name['en-US']
	description?: string; // Extracted from ceasn:description['en-US']
	publisher?: string; // Extracted from ceasn:publisherName['en-US']
	skillCount: number; // Pre-computed from hasTopChild length
}

// Quick pick item (union type for display)
export interface QuickPickItem {
	type: 'Skill' | CtdlSkillContainerType | 'Framework';
	entity: Skill | CtdlSkillContainerSearchResult | CtdlFrameworkSearchResult;
	// For containers/frameworks, pre-fetched skills for quick add
	skills?: Skill[];
}

// Enhanced Skill with CTDL source tracking
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
```

## API Contract

```typescript
// Existing endpoint extended
POST /api/skill-search
Body: {
  query: string;
  limit?: number;
  mode: 'skills' | 'containers' | 'frameworks'; // NEW
}

Response (mode='skills'): SkillSearchResult[]
Response (mode='containers'): ContainerSearchResult[]
Response (mode='frameworks'): FrameworkSearchResult[]

// New endpoint for batch skill fetch
POST /api/skills/batch
Body: {
  urls: string[]; // Array of @id values
}
Response: Skill[]

// New endpoint for single resource fetch
GET /api/resource?url=<encoded-url>
Response: Full JSON-LD entity (Job, Occupation, etc.)
```

## Mobile Dialog Behavior

- **Trigger**: "Add Skills" button below selected skills column
- **Dialog**: Full-screen or nearly full-screen (max-w-lg)
- **Content**: Same search interface as desktop sidebar
- **Close**: "Done" button or swipe down
- **Selection**: Clicking container drills down within dialog
- **Return**: Selected skills appear in main page column after close

## Storybook Stories Required

1. **QuickPicks**
   - Default with mixed types
   - With selections
   - Mobile responsive

2. **EntityResultItem**
   - Occupation type
   - Job type
   - Framework type
   - Selected state

3. **ContainerSkillView**
   - Loading state
   - With skills list
   - Some skills already selected
   - Empty skills (edge case)

4. **SkillSearch (updated)**
   - Skills mode (existing)
   - Containers mode with results
   - Frameworks mode
   - Drill-down view
   - Mobile dialog wrapper

5. **CreateJobPage (updated)**
   - Desktop layout
   - Mobile with dialog open
   - With selected skills
