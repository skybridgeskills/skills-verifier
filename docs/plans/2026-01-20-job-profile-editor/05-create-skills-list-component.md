# Phase 5: Create Skills List Component

## Overview

Implement SkillsList component with skeleton loading, filtering/searching, and selection count display. Create Storybook stories for all states.

## Tasks

1. Create `src/lib/components/SkillsList.svelte`:
   - Props: `framework: Framework | null`, `selectedSkills: Skill[]`, `onToggleSkill: (skill: Skill) => void`, `service: FrameworkService`
   - Fetches skills from selected framework using framework-service:
     - Show skeleton loading state while fetching framework JSON-LD
     - Show skeleton loading state while fetching individual skill URLs
   - Displays skills with SkillItem components
   - Filter/search capability:
     - Search input field
     - Filter skills by label or text
   - Shows selection count (e.g., "10 of 25 selected")
   - Manages checkbox state for each skill
   - Emits selection changes to parent
   - Handles errors (show error message, allow retry)
   - Use container queries for responsive design

2. Create `src/lib/components/SkillsList.stories.svelte`:
   - Story with no framework selected
   - Story showing skeleton loading (framework fetch)
   - Story showing skeleton loading (skills fetch)
   - Story with skills loaded
   - Story with search filtering active
   - Story showing error state
   - Story with partial results (some skills failed)
   - Use ResponsivePreview for breakpoint testing
   - Use FakeFrameworkService for stories

## Tests

- No unit tests needed for this phase (UI component, tested via Storybook)

## Success Criteria

- [ ] SkillsList fetches skills from selected framework
- [ ] Skeleton loading states display correctly (framework and skills)
- [ ] Skills display with SkillItem components
- [ ] Search/filter functionality works
- [ ] Selection count displays correctly
- [ ] Error handling works (shows error, allows retry)
- [ ] Storybook stories render correctly for all states
- [ ] ResponsivePreview works in stories
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
