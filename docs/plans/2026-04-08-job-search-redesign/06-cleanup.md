# Phase 6: Cleanup & Validation

## Scope

Complete Storybook coverage, remove old components, and final validation.

## Implementation

### 1. Remove Old Components

Delete `src/lib/components/quick-skill-picks/` directory:

- `QuickSkillPicks.svelte`
- Any associated stories

Update all imports to use new `QuickPicks` from `quick-picks/`.

### 2. Storybook Coverage Checklist

Ensure all components have stories:

- [ ] `QuickPicks.stories.svelte` - Default, With selections, Mobile, Occupations only
- [ ] `QuickPickItem.stories.svelte` - All type variants, Selected state
- [ ] `EntityResultItem.stories.svelte` - Occupation, Job, Framework, With/without description
- [ ] `CtdlSkillContainerView.stories.svelte` - Loading, With skills, Empty, Error states
- [ ] `CtdlEntityHeader.stories.svelte` - All CTDL types
- [ ] `SkillSearch.stories.svelte` - Skills mode, Containers mode, Frameworks mode, Drill-down
- [ ] `SkillSearchResultItem.stories.svelte` - With source indicator
- [ ] `CreateJobPage.stories.svelte` - Desktop, Mobile dialog, With selections

### 3. Responsive Previews

Use `ResponsivePreview` from `@repo/lib-ui` in all stories:

```svelte
<script lang="ts" module>
	import { ResponsivePreview } from '@repo/lib-ui';
</script>

<Story name="Mobile">
	<ResponsivePreview width={375}>
		<Component />
	</ResponsivePreview>
</Story>
```

### 4. Final Validation

```bash
# Type checking
pnpm turbo check

# Tests
pnpm turbo test

# Build
pnpm turbo build

# Storybook specific tests
cd apps/storybook && pnpm test:storybook
```

### 5. Check for TODOs and Cleanup

```bash
# Find any temporary code
grep -r "TODO" src/lib/components/skill-search/ src/lib/components/quick-picks/ src/lib/components/ctdl-skill-container-view/ src/lib/components/entity-result-item/
grep -r "console.log" src/
grep -r "FIXME" src/
```

Remove all temporary code and debug statements.

### 6. Update Documentation

Ensure `00-design.md` reflects final implementation.

## Commit Message

```
feat(skill-search): multi-mode CTDL entity search with drill-down

- Add CTDL-aligned types (CtdlSkillContainer, CtdlCompetencyFramework)
- Create QuickPicks component supporting multiple entity types
- Implement multi-mode search: Skills, Jobs/Occupations, Frameworks
- Add drill-down skill selection view for CTDL containers
- Restructure CreateJobPage with sidebar search (desktop) and dialog (mobile)
- Show skill source when added from containers/frameworks
- Complete Storybook coverage for all new components
```

## Summary

This plan delivers:

1. CTDL-aligned type system matching Credential Engine API
2. Quick picks with type badges for Skills, Jobs, Occupations
3. Three-tab search interface with drill-down navigation
4. Responsive layout: sidebar (desktop), dialog (mobile)
5. Skill source tracking in selected skills list
6. Full Storybook coverage
