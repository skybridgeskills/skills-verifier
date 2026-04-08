# Job Search Redesign - Plan Summary

## Overview

Redesign the job creation experience in skills-verifier with an enhanced multi-mode search interface supporting CTDL-aligned entities from Credential Engine Registry.

## Key Changes

1. **Multi-Type Quick Picks**: Replace single-type skill picks with mixed-type picks (Skills, Jobs, Occupations, etc.) showing CTDL type badges

2. **Three-Mode Search Interface**:
   - Individual Skills - search competencies directly
   - Jobs & Occupations - search CTDL skill containers (ceterms:Job, ceterms:Occupation, ceterms:WorkRole, ceterms:Task)
   - Skill Frameworks - search CTDL competency frameworks (ceasn:CompetencyFramework)

3. **Drill-Down Selection**: Selecting a Job/Occupation/Framework enters a focused view showing its associated skills

4. **Responsive Layout**:
   - Desktop: Right sidebar with quick picks + search
   - Mobile: Full-screen dialog for search

5. **Source Tracking**: Selected skills show their CTDL source (e.g., "From Occupation: Acute Care Nurses")

6. **CTDL-Aligned Types**: Data models follow Credential Transparency Description Language structure

## Files Created/Modified

### New Components

- `quick-picks/QuickPicks.svelte` - Multi-type quick picks with badges
- `quick-picks/QuickPickItem.svelte` - Single tag with type label
- `entity-result-item/EntityResultItem.svelte` - CTDL entity search result
- `ctdl-skill-container-view/CtdlSkillContainerView.svelte` - Drill-down skill view
- `ctdl-skill-container-view/CtdlEntityHeader.svelte` - Entity summary with back button

### Updated Components

- `skill-search/SkillSearch.svelte` - Mode tabs, drill-down state
- `skill-search/SkillSearchResultItem.svelte` - Source indicator support
- `selected-skills-column/SelectedSkillsColumn.svelte` - Source display
- `pages/CreateJobPage.svelte` - New responsive layout

### New/Updated Types & Config

- `types/job-profile.ts` - CTDL-aligned interfaces
- `clients/skill-search-client.ts` - Multi-mode search, batch fetch
- `config/sample-entities.ts` - Sample CTDL occupations, jobs, skills

### Removed

- `quick-skill-picks/QuickSkillPicks.svelte` - Replaced by QuickPicks

## Phases

1. Type definitions and client updates
2. Quick picks component (multi-type)
3. Entity result item and CTDL skill container view
4. SkillSearch component update
5. CreateJobPage layout restructure
6. Storybook coverage and cleanup

## Dependencies

Requires Credential Engine API endpoints:

- `POST /api/skill-search` with `mode` parameter
- `POST /api/skills/batch` for batch skill fetch
- `GET /api/resource` for single CTDL entity fetch
