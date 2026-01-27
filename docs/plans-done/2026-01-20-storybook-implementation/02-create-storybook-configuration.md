# Phase 2: Create Storybook Configuration

## Objective

Set up Storybook configuration files with proper story paths, addons, and framework settings.

## Tasks

- Create `.storybook/main.ts` with:
  - Story paths for `src/routes/**/*.stories.svelte` and `src/lib/components/**/*.stories.svelte`
  - Required addons configuration
  - Framework configuration for @storybook/sveltekit
  - Vite configuration adjustments if needed
- Create `.storybook/preview.ts` with:
  - Global decorators (if any)
  - Parameters for controls and a11y
  - Import app.css for styling

## Files to Create

- `.storybook/main.ts`
- `.storybook/preview.ts`

## Configuration Details

- Use default Storybook indexing (no custom indexer)
- Configure stories to load from routes and components directories
- Set up addons: svelte-csf, a11y, docs, interactions
- Configure preview with controls matchers and a11y settings

## Success Criteria

- Storybook configuration files created
- Story paths correctly configured
- All addons properly configured
- Preview configuration includes necessary parameters
- Code compiles without errors

## Tests

- Run `pnpm storybook` to verify configuration loads correctly
- Check that Storybook starts without errors
- Verify story paths are recognized (even if no stories exist yet)
