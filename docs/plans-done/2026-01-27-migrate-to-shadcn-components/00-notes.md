# Migrate to shadcn-svelte Components Plan

## Scope of Work

Update existing UI components and pages to use shadcn-svelte components:

- Replace custom Card component with shadcn-svelte Card
- Update form components (JobProfileForm) to use shadcn Input, Label, Button, Textarea
- Update interactive components (FrameworkSelector, SkillsList, SelectedSkillsColumn) to use shadcn components
- Replace custom success/error messages with shadcn Alert components
- Update SkillItem to use shadcn components where appropriate
- Ensure all components work with dark mode
- Update Storybook stories to reflect new components

## Current State

### Existing Components

1. **Card** (`src/lib/components/card/Card.svelte`)
   - Simple wrapper component with basic styling
   - Only used in Storybook stories, not in actual pages
   - Can be easily replaced with shadcn Card

2. **JobProfileForm** (`src/lib/components/job-profile-form/JobProfileForm.svelte`)
   - Uses native HTML `<input>`, `<textarea>`, `<label>`, `<button>`
   - Has custom validation error display
   - Uses custom Tailwind classes for styling

3. **FrameworkSelector** (`src/lib/components/framework-selector/FrameworkSelector.svelte`)
   - Uses native HTML `<input>` for search
   - Uses native HTML `<button>` for framework selection
   - Has custom loading/error states

4. **SkillsList** (`src/lib/components/skills-list/SkillsList.svelte`)
   - Uses native HTML `<input>` for search
   - Uses SkillItem component for each skill
   - Has custom loading/error states

5. **SelectedSkillsColumn** (`src/lib/components/selected-skills-column/SelectedSkillsColumn.svelte`)
   - Uses native HTML `<button>` for remove actions
   - Has custom warning message styling

6. **SkillItem** (`src/lib/components/skill-item/SkillItem.svelte`)
   - Uses native HTML `<label>` and `<input type="checkbox">`
   - Has custom styling for selected/unselected states

### Pages

1. **CreateJobPage** (`src/lib/pages/CreateJobPage.svelte`)
   - Main page component that orchestrates all the above components
   - Has custom success/error message styling
   - Uses custom Tailwind classes throughout

### Available shadcn-svelte Components

- Button
- Card (with CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction)
- Input
- Label
- Badge
- ThemeToggle (already created)

### Missing shadcn-svelte Components (may need to add)

- Textarea (for JobProfileForm description field)
- Alert (for success/error messages)

## Questions

### Q1: Should we replace the custom Card component with shadcn Card?

**Context**: The custom Card component is simple and only used in Storybook stories. The shadcn Card is more feature-rich with sub-components (CardHeader, CardContent, etc.).

**Answer**: Yes, replace it. The shadcn Card is more flexible and provides better structure. Update the Storybook stories to use the new Card component.

### Q2: Should we add Textarea component from shadcn-svelte?

**Context**: JobProfileForm uses a native `<textarea>` for the description field. shadcn-svelte has a Textarea component that would provide consistent styling.

**Answer**: Yes, add the Textarea component and use it in JobProfileForm.

### Q3: Should we add Alert component from shadcn-svelte?

**Context**: CreateJobPage and other components have custom success/error message styling. shadcn-svelte has Alert components that would provide consistent styling and better accessibility.

**Answer**: Yes, add Alert component and use it for success/error messages throughout the application.

### Q4: How should we handle the checkbox styling in SkillItem?

**Context**: SkillItem uses a native checkbox with custom styling. shadcn-svelte has a Checkbox component that would provide consistent styling.

**Answer**: Add the Checkbox component from shadcn-svelte and use it in SkillItem. This will provide better styling and consistency.

### Q5: Should we update the button styling in FrameworkSelector and SelectedSkillsColumn?

**Context**: These components use native buttons with custom Tailwind classes. shadcn Button component would provide consistent styling and variants.

**Answer**: Yes, replace native buttons with shadcn Button components. Use appropriate variants (e.g., "outline" for framework selection, "ghost" for remove actions).

### Q6: Should we update the page-level styling in CreateJobPage?

**Context**: CreateJobPage has custom Tailwind classes for headings, spacing, etc. We could use shadcn components or keep the current structure but ensure it works with the theme system.

**Answer**: Keep the current structure but ensure all custom classes work with the theme system (use theme variables where appropriate). The page layout is fine, but individual components should use shadcn components.

### Q7: Should we update the empty state messages?

**Context**: Several components have empty state messages with custom styling. We could use shadcn components or keep them as-is.

**Answer**: Use shadcn components idiomatically. Update empty states to use shadcn Card or other appropriate components to maintain consistency with the design system.

### Q8: Should we update the loading skeleton states?

**Context**: FrameworkSelector and SkillsList have custom loading skeleton states. shadcn-svelte has a Skeleton component.

**Answer**: Yes, add the Skeleton component and use it for loading states. This will provide consistent loading indicators.
