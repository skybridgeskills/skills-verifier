# Phase 4: Create Framework Selector Component

## Overview

Implement searchable FrameworkSelector component with loading states and error handling. Create Storybook stories for all states.

## Tasks

1. Create `src/lib/components/FrameworkSelector.svelte`:
   - Props: `frameworks: Framework[]`, `onSelect: (framework: Framework) => void`
   - Searchable list of frameworks:
     - Search input field
     - Filter frameworks by name or organization
     - Display framework name and organization
   - Handle framework selection
   - Show loading state when fetching framework data (skeleton)
   - Show error state if framework fetch fails
   - Emit selected framework to parent
   - Use container queries for responsive design

2. Create `src/lib/components/FrameworkSelector.stories.svelte`:
   - Default story with all frameworks
   - Story with search filtering active
   - Story showing loading state (skeleton)
   - Story showing error state
   - Story with empty search results
   - Use ResponsivePreview for breakpoint testing
   - Use FakeFrameworkClient for stories

## Tests

- No unit tests needed for this phase (UI component, tested via Storybook)

## Success Criteria

- [ ] FrameworkSelector displays frameworks from config
- [ ] Search functionality filters frameworks correctly
- [ ] Loading skeleton displays when fetching
- [ ] Error state displays on fetch failure
- [ ] Selection emits to parent correctly
- [ ] Storybook stories render correctly for all states
- [ ] ResponsivePreview works in stories
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
