# Phase 3: Cleanup and Validation

## Scope of phase

Clean up any temporary code, verify everything works, and ensure the files are ready for use.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

1. **Check for temporary code**:
   - Grep git diff for TODO comments, debug prints, or temporary code
   - Remove any temporary code found

2. **Verify file structure**:
   - Ensure both files have proper license headers
   - Ensure all dependencies are properly inlined
   - Ensure imports are correct (only `provider-ctx.ts` imports from `providers.ts`)

3. **Check exports**:
   - Verify all necessary exports are present
   - Ensure types are properly exported

4. **Format and lint**:
   - Run formatter to ensure consistent formatting
   - Fix any linting errors

5. **Type checking**:
   - Ensure TypeScript compiles without errors
   - Ensure all types are properly inferred

## Validate

Run the following commands to validate:

```bash
turbo check test
```

All checks should pass:

- TypeScript compilation should succeed
- Linting should pass
- Formatting should be consistent
- No temporary code or TODOs should remain

Fix any warnings, errors, and formatting issues that appear.
