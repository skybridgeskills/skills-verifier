# Phase 3: Create Base Components (SkillItem, JobProfileForm)

## Overview

Implement SkillItem component with abbreviated display (label/text) and JobProfileForm component. Create Storybook stories for both components.

## Tasks

1. Create `src/lib/components/SkillItem.svelte`:
   - Props: `skill: Skill`, `selected: boolean`, `onToggle: (skill: Skill) => void`
   - Display abbreviated view:
     - Show `ceasn:competencyLabel` if present
     - Fallback to `ceasn:competencyText` if label not present
     - If both present, show label prominently with text below in less emphasized font
   - Checkbox for selection
   - Click handler to toggle selection
   - Use container queries for responsive design

2. Create `src/lib/components/SkillItem.stories.svelte`:
   - Story with label only
   - Story with text only
   - Story with both label and text
   - Story with selected state
   - Story with unselected state
   - Use ResponsivePreview for breakpoint testing

3. Create `src/lib/components/JobProfileForm.svelte`:
   - Form inputs:
     - Job name (text input, required)
     - Description (textarea, required, one sentence)
     - Company name (text input, required)
   - Form validation
   - Emit form data to parent via callback prop
   - Use container queries for responsive design

4. Create `src/lib/components/JobProfileForm.stories.svelte`:
   - Default story
   - Story with pre-filled values
   - Story showing validation errors
   - Use ResponsivePreview for breakpoint testing

## Tests

- No unit tests needed for this phase (UI components, tested via Storybook)

## Success Criteria

- [ ] SkillItem component displays skills correctly (label/text logic)
- [ ] SkillItem checkbox toggles selection
- [ ] JobProfileForm collects all required fields
- [ ] JobProfileForm validates inputs
- [ ] Storybook stories render correctly for both components
- [ ] ResponsivePreview works in stories
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
