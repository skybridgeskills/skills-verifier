# Phase 7: Create CreateJobPage Component

## Overview

Implement CreateJobPage component that orchestrates all components, manages state, handles save functionality, and coordinates between SkillsList and SelectedSkillsColumn. Create Storybook stories for full flow and all states.

## Tasks

1. Create `src/lib/pages/CreateJobPage.svelte`:
   - Orchestrates all components:
     - JobProfileForm
     - FrameworkSelector
     - SkillsList
     - SelectedSkillsColumn
   - Manages state:
     - Selected framework
     - Selected skills array
     - Form data (job name, description, company)
   - Coordinates between SkillsList and SelectedSkillsColumn:
     - Shared selectedSkills state
     - Handles skill toggle (add/remove)
   - Handles save action:
     - Validates form (all fields required)
     - Validates at least one skill selected
     - Shows success message (no persistence yet)
   - Handles error states:
     - Framework fetch errors
     - Skill fetch errors
   - Uses framework-service (from props or context)
   - Use container queries for responsive design

2. Create `src/lib/pages/CreateJobPage.stories.svelte`:
   - Default story (initial state)
   - Story with framework selected, loading skills
   - Story with skills loaded
   - Story with skills selected
   - Story with form filled out
   - Story showing success message after save
   - Story showing validation errors
   - Story showing error states
   - Use ResponsivePreview for breakpoint testing
   - Use FakeFrameworkService for stories

## Tests

- No unit tests needed for this phase (UI component, tested via Storybook)

## Success Criteria

- [ ] CreateJobPage orchestrates all components correctly
- [ ] State management works (framework, skills, form data)
- [ ] Skill selection coordinates between SkillsList and SelectedSkillsColumn
- [ ] Save action validates and shows success message
- [ ] Error handling works for all error cases
- [ ] Storybook stories render correctly for full flow and all states
- [ ] ResponsivePreview works in stories
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
