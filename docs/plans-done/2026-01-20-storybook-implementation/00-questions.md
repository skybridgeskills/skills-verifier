# Questions for Storybook Implementation

## Component Directory Structure

1. **Component Location**: ✅ **ANSWERED**: `src/lib/components/` (following SvelteKit conventions)

## Storybook Configuration

2. **Storybook Version**: ✅ **ANSWERED**: v10.0.2 (same as monorepo)

3. **Package Manager**: ✅ **ANSWERED**: Use `pnpm` (consistent with existing project)

4. **Story Indexing**: ✅ **ANSWERED**: Use Storybook's default indexing with configured stories paths

## Example Component

5. **Card Component**: ✅ **ANSWERED**: Simple presentational component with spacing, responsiveness, and visual wrapping. No behavior. Use Tailwind classes.

## Testing

6. **Storybook Testing**: ✅ **ANSWERED**: Set up capability for actions and interaction tests with play functions using out-of-the-box Storybook functionality (no complex backend mocking)

## Build & Scripts

7. **Scripts**: ✅ **ANSWERED**: Add `storybook`, `build-storybook`, and optionally `test:storybook` scripts
