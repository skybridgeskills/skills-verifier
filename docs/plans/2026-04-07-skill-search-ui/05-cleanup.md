# Phase 5: Cleanup

## Scope of phase

- Remove unused imports and components
- Delete or archive unused files (FrameworkSelector, SkillsList)
- Update any remaining references
- Final validation

## Code Organization Reminders

- Don't delete files with git history value — move to archive or mark deprecated
- Remove from barrel exports if applicable
- Clean up unused imports in related files

## Implementation Details

### 5.1 Identify unused components

These are now unused in CreateJobPage:

- `src/lib/components/framework-selector/FrameworkSelector.svelte`
- `src/lib/components/framework-selector/FrameworkSelector.stories.svelte`
- `src/lib/components/skills-list/SkillsList.svelte`
- `src/lib/components/skills-list/SkillsList.stories.svelte`

### 5.2 Option A: Delete completely

If no other usage exists:

```bash
# Check for any other imports
grep -r "FrameworkSelector" src/ --include="*.svelte" --include="*.ts"
grep -r "SkillsList" src/ --include="*.svelte" --include="*.ts"

# If only in CreateJobPage (which we're updating), delete:
rm src/lib/components/framework-selector/FrameworkSelector.svelte
rm src/lib/components/framework-selector/FrameworkSelector.stories.svelte
rm src/lib/components/skills-list/SkillsList.svelte
rm src/lib/components/skills-list/SkillsList.stories.svelte

# Remove empty directories
rmdir src/lib/components/framework-selector 2>/dev/null || true
rmdir src/lib/components/skills-list 2>/dev/null || true
```

### 5.3 Option B: Move to archive

If we want to preserve for reference:

```bash
mkdir -p src/lib/components/.archive/framework-selector
mkdir -p src/lib/components/.archive/skills-list
mv src/lib/components/framework-selector/* src/lib/components/.archive/framework-selector/
mv src/lib/components/skills-list/* src/lib/components/.archive/skills-list/
rmdir src/lib/components/framework-selector
rmdir src/lib/components/skills-list
```

### 5.4 Remove unused imports from CreateJobPage

Check for any remaining imports:

- `FrameworkClient` type (if not used elsewhere)
- `FRAMEWORKS` constant
- `createFrameworkService` (if service prop removed)

Remove if not needed:

```typescript
// Remove if no longer needed:
// import {
//   createFrameworkService,
//   type FrameworkClient
// } from '$lib/clients/framework-client/framework-client';
// import FrameworkSelector from '$lib/components/framework-selector/FrameworkSelector.svelte';
// import SkillsList from '$lib/components/skills-list/SkillsList.svelte';
// import { FRAMEWORKS } from '$lib/config/frameworks';
```

### 5.5 Update barrel exports if applicable

If there's an index.ts exporting these:

```typescript
// src/lib/components/index.ts or similar
// Remove:
// export { default as FrameworkSelector } from './framework-selector/FrameworkSelector.svelte';
// export { default as SkillsList } from './skills-list/SkillsList.svelte';
```

### 5.6 Check for unused types

In `src/lib/types/job-profile.ts`:

- Is `Framework` type still used anywhere?
- If only in removed components, consider removing or keeping for future

```typescript
// Framework type - check usage
grep -r "Framework" src/ --include="*.svelte" --include="*.ts" | grep -v "FrameworkSelector"
```

### 5.7 Clean up unused configuration

In `src/lib/config/frameworks.ts`:

- If no longer used, this can be removed

```bash
grep -r "FRAMEWORKS" src/ --include="*.svelte" --include="*.ts"
# If only in deleted components, remove file
```

## Final validation

### Checklist

- [ ] No TypeScript errors
- [ ] No unused imports (ESLint should catch)
- [ ] No broken stories (Storybook builds)
- [ ] No runtime errors in dev server
- [ ] Form submission works end-to-end
- [ ] Page layout looks correct

### Commands

```bash
# TypeScript
pnpm check:typescript

# ESLint (catches unused imports)
pnpm check:eslint

# Prettier
pnpm check:prettier

# Build
pnpm build:svelte

# Tests
CONTEXT=test pnpm test:vitest

# Storybook
pnpm build:storybook
```

## Summary of changes

### Files created

- `src/lib/clients/skill-search-client.ts`
- `src/lib/clients/skill-search-client.test.ts`
- `src/lib/components/skill-search/SkillSearchResultItem.svelte`
- `src/lib/components/skill-search/SkillSearchResultItem.stories.svelte`
- `src/lib/components/skill-search/SkillSearch.svelte`
- `src/lib/components/skill-search/SkillSearch.stories.svelte`
- `src/lib/components/skill-search/index.ts`

### Files modified

- `src/lib/types/job-profile.ts` — Added `description` to `Skill`
- `src/lib/pages/CreateJobPage.svelte` — Complete rewrite with new layout
- `src/routes/jobs/create/+page.server.ts` — Optional: make `frameworksJson` optional

### Files deleted/moved

- `src/lib/components/framework-selector/FrameworkSelector.svelte`
- `src/lib/components/framework-selector/FrameworkSelector.stories.svelte`
- `src/lib/components/skills-list/SkillsList.svelte`
- `src/lib/components/skills-list/SkillsList.stories.svelte`
- `src/lib/config/frameworks.ts` — If unused

## Commit message

```
feat(ui): replace framework-first skill selection with direct skill search

- Add SkillSearch component with debounced Credential Engine search
- Add SkillSearchResultItem for displaying and selecting results
- Update CreateJobPage with skills-first layout (two-column)
- Remove FrameworkSelector and SkillsList components
- Keep QuickSkillPicks for fast curated skill selection
- Add description field to Skill type
- Create skill-search-client for API communication
```
