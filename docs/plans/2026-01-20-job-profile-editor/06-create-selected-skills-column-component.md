# Phase 6: Create Selected Skills Column Component

## Overview
Implement SelectedSkillsColumn component with warning for >10 skills and remove functionality. Create Storybook stories.

## Tasks

1. Create `src/lib/components/SelectedSkillsColumn.svelte`:
   - Props: `selectedSkills: Skill[]`, `onRemoveSkill: (skill: Skill) => void`
   - Displays selected skills in primary column
   - Shows warning if >10 skills selected (light warning style)
   - Shows suggestion text: "We recommend selecting 5-10 of the most important skills"
   - Allows removing skills from selection (remove button/action)
   - Displays skills using SkillItem or similar display
   - Use container queries for responsive design

2. Create `src/lib/components/SelectedSkillsColumn.stories.svelte`:
   - Story with no skills selected
   - Story with 5 skills selected (recommended range)
   - Story with 10 skills selected (at limit)
   - Story with 15 skills selected (showing warning)
   - Story with many skills selected
   - Use ResponsivePreview for breakpoint testing

## Tests

- No unit tests needed for this phase (UI component, tested via Storybook)

## Success Criteria

- [ ] SelectedSkillsColumn displays selected skills
- [ ] Warning displays when >10 skills selected
- [ ] Suggestion text displays
- [ ] Remove functionality works
- [ ] Storybook stories render correctly for all states
- [ ] ResponsivePreview works in stories
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
