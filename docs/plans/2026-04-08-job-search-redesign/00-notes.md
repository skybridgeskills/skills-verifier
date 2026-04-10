# Job Search Redesign - Analysis & Planning

## Scope of Work

This plan covers redesigning the job creation experience in skills-verifier with an enhanced search interface that supports multiple entity types (Skills, Jobs, Occupations, WorkRoles, Tasks, Skill Frameworks).

### Key Changes

1. **Quick Picks Update**: Replace "Quick pick skills" with "Quick pick" that includes:
   - Skills (existing)
   - Jobs (employer-specific instances of occupations)
   - Occupations (e.g., "Acute Care Nurse", "Clinical Nurse Specialist")
   - WorkRoles and Tasks (similar pattern)

   Displayed as tags with type labels (e.g., "Occupation: Acute Care Nurse")

2. **Search Interface Reorganization**:
   - Move search outside the job create form (fix HTML form nesting violation)
   - Desktop: Right sidebar with quick picks + search interface
   - Mobile: Dialog-based search interface
   - Job info form first, selected skills below it

3. **Multi-Mode Search**:
   - Individual Skills search (existing)
   - Job/Occupation/WorkRole/Task search (new)
   - Skill Framework search (new)
   - Tab-based switching between modes
   - Selecting a Job/Occupation shows its associated skills

4. **Storybook Coverage**:
   - Individual skill search results
   - Job/Occupation search results
   - Expanded job view with skill list
   - Reusable skill result component

## Current State of Codebase

### Components Structure

```
src/lib/components/
├── skill-search/
│   ├── SkillSearch.svelte           # Current keyword search
│   ├── SkillSearchResultItem.svelte # Individual skill result
│   └── *.stories.svelte
├── quick-picks/
│   ├── QuickPicks.svelte             # Multi-type quick picks (replaces QuickSkillPicks)
│   └── QuickPickItem.svelte
├── selected-skills-column/
│   └── SelectedSkillsColumn.svelte  # Selected skills display
├── job-profile-form/
│   └── JobProfileForm.svelte        # Job info form (embedded mode exists)
└── skill-item/
    └── SkillItem.svelte             # Skill display component
```

### Types

- `Skill` interface exists with `url`, `label`, `text`, `ctid`, `frameworkUrl`
- `Framework` interface exists
- Need new types for: `Job`, `Occupation`, `WorkRole`, `Task`, `SkillFramework`

### Data from Credential Engine

Example data shows CTDL/CTDL-ASN structure with:

- `@id`, `@type`, `ceterms:ctid`
- `ceterms:name` (LanguageString)
- `ceterms:description` (LanguageString)
- `ceasn:skillEmbodied` - array of skill URLs
- `ceasn:abilityEmbodied` - array of ability URLs
- `ceasn:knowledgeEmbodied` - array of knowledge URLs
- `ceterms:occupationType` - alignment objects with coded notation

## Questions to Answer

### Question 1: Entity Type Definitions ✓

**Answer**: Option A - Group Jobs, Occupations, WorkRoles, and Tasks into a single "Jobs & Occupations" tab. On mobile, can hide "& Occupations" text if space is limited (show just "Jobs").

**Decision**:

- "Individual Skills" tab - search skills directly
- "Jobs & Occupations" tab - search Jobs, Occupations, WorkRoles, Tasks together (all "skill containers")
- "Skill Frameworks" tab - search frameworks (documents containing skills)

### Question 2: API/Search Implementation ✓

**Answer**: Single endpoint approach with the following flow for container entities:

1. **Search request**: Query Jobs/WorkRoles/Occupations/Tasks by keyword (name/description)
   - Returns list with basic info: name, description, ctid, type, skillCount (from the three embodied arrays)

2. **Detail request**: When user selects a container, fetch its full resource
   - Already have URL from search results
   - Get `ceasn:skillEmbodied`, `ceasn:knowledgeEmbodied`, `ceasn:abilityEmbodied` arrays

3. **Batch skill fetch**: Query for all competencies with IDs in the combined unique set:
   ```json
   {
   	"@id": [
   		"https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac",
   		"https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac"
   	]
   }
   ```

**API Design**:

- Extend `/api/skill-search` with `mode` parameter:
  - `mode: 'skills'` - current behavior (search skills by keyword)
  - `mode: 'containers'` - search Jobs/Occupations/WorkRoles/Tasks by keyword
  - `mode: 'frameworks'` - search skill frameworks by keyword
- New endpoint: `POST /api/container-skills` - batch fetch skills by URL list
- Or could be: `GET /api/resource?id=<url>` to fetch a specific container/resource

### Question 3: Container Entity Selection UX ✓

**Answer**: Drill-down view approach confirmed. When clicking a Job/Occupation/Framework:

- Search results pane transforms to show:
  - Container summary at top (name, type, description, skill count)
  - Back button near the summary to return to search results
  - Skill list below with add/remove toggles
- "Add All" button to bulk-add container skills
- Clean separation between search and selection modes keeps user focused

### Question 4: Quick Pick Data Source

**Context**: Currently `SAMPLE_SKILLS` is hardcoded. For the new quick picks with multiple entity types:

**Suggested approach**:

- Preload sample data for Occupations (from the example JSON provided)
- Keep some sample Skills
- Include type labels in the tag display
- Consider fetching popular/quick picks from API eventually (future enhancement)

### Question 5: Mobile Dialog Design

**Context**: On mobile, search appears in a Dialog. Need to decide:

**Suggested approach**:

- Full-screen or nearly full-screen dialog on mobile
- Tabs at top for mode switching
- Search input + results below
- Container selection enters a "drill-down" view with back button
- Selected skills shown as chips that can be removed
- "Done" button to close dialog and return to main form

### Question 6: Selected Skills Display

**Context**: The current `SelectedSkillsColumn` shows selected skills below the job form.

**Suggested approach**:

- Keep this placement (selected skills below job form)
- Enhance to show source indicator (e.g., "from Acute Care Nurse occupation")
- Keep remove functionality

## Style Conventions (from docs/style/)

- **Factory functions** over classes
- **ZodFactory** for schemas when runtime validation needed
- **Organize by domain**, not by type
- **Order by abstraction** - high-level first, helpers later
- **File size** - extract when approaching ~200 lines
- **Co-locate tests** as `<file>.test.ts`
- **Import order**: external → $lib/ → relative

## Notes

(Will be populated with user answers)
