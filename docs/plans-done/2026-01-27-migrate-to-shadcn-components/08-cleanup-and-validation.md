# Phase 8: Cleanup and Validation

## Scope of Phase

Final cleanup, review, and validation of the migration:

- Remove any temporary code or TODOs
- Verify all components work correctly
- Ensure dark mode works throughout
- Update any remaining custom classes to use theme variables
- Run full test suite
- Fix any warnings or errors
- Verify Storybook stories work

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Remove Temporary Code

Search for any TODO comments or temporary code:

```bash
grep -r "TODO" src/
grep -r "FIXME" src/
grep -r "TEMP" src/
```

Remove or address any temporary code found.

### Verify Theme Variables

Search for hardcoded color classes that should use theme variables:

```bash
grep -r "text-gray-" src/lib/components/
grep -r "bg-gray-" src/lib/components/
grep -r "border-gray-" src/lib/components/
```

Update any remaining hardcoded colors to use theme variables:

- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-700` → `text-foreground` or `text-muted-foreground`
- `bg-gray-50` → `bg-muted`
- `bg-gray-100` → `bg-muted`
- `border-gray-200` → `border-border`
- `border-gray-300` → `border-border` or `border-input`

### Verify Dark Mode

Test dark mode functionality:

1. Toggle dark mode using the ThemeToggle component
2. Verify all components render correctly in dark mode
3. Check that text is readable
4. Verify that borders and backgrounds are visible
5. Test all interactive states (hover, focus, etc.)

### Verify Component Functionality

Test each updated component:

1. **JobProfileForm**: Form submission, validation, error display
2. **FrameworkSelector**: Search, selection, loading, error states
3. **SkillsList**: Search, loading, error states, skill selection
4. **SelectedSkillsColumn**: Remove functionality, warning display, empty state
5. **SkillItem**: Checkbox selection
6. **CreateJobPage**: Success/error messages, overall flow

### Verify Storybook Stories

Check that all Storybook stories work:

1. Run Storybook: `pnpm storybook`
2. Verify each component story displays correctly
3. Test dark mode toggle in Storybook
4. Verify all stories are accessible

### Check for Warnings

Run the full check suite and fix any warnings:

```bash
turbo check test
```

Address any:

- TypeScript errors
- ESLint warnings
- Prettier formatting issues
- Missing dependencies
- Import errors

### Verify Accessibility

Ensure accessibility is maintained:

- Keyboard navigation works
- Screen reader compatibility
- Focus indicators are visible
- ARIA attributes are correct

## Validate

Run the complete validation suite:

```bash
turbo check test
```

This should pass without errors or warnings. Verify:

- ✅ All TypeScript checks pass
- ✅ All linting checks pass
- ✅ All formatting checks pass
- ✅ All tests pass
- ✅ Dev server starts without errors
- ✅ Storybook builds and runs correctly
- ✅ Components render correctly in both light and dark modes
- ✅ No console errors or warnings
- ✅ All functionality works as expected

### Final Verification Checklist

- [ ] All shadcn components added successfully
- [ ] All components migrated to use shadcn components
- [ ] Old Card component removed
- [ ] All theme variables used correctly
- [ ] Dark mode works throughout
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No formatting issues
- [ ] All tests pass
- [ ] Storybook stories work
- [ ] No temporary code remaining
- [ ] All functionality preserved
