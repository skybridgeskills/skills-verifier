# Phase 8: Create SvelteKit Route

## Overview
Create /jobs/create route with thin +page.svelte wrapper. Add Storybook configuration for pages directory. Test route integration.

## Tasks

1. Create `src/routes/jobs/create/+page.svelte`:
   - Thin wrapper that:
     - Imports CreateJobPage component
     - Gets framework-service instance (from .env config)
     - Passes service to CreateJobPage
     - Handles any route-level concerns

2. Update `.storybook/main.ts`:
   - Add `../src/lib/pages/**/*.stories.@(js|ts|svelte)` to stories array
   - Ensure pages directory is included in Storybook

3. Test route integration:
   - Navigate to `/jobs/create` in dev server
   - Verify page loads correctly
   - Verify framework selection works
   - Verify skill selection works
   - Verify save functionality works

## Tests

- No unit tests needed for this phase (route integration tested manually)

## Success Criteria

- [ ] Route `/jobs/create` exists and loads
- [ ] +page.svelte is thin wrapper connecting to CreateJobPage
- [ ] Framework service is instantiated correctly from .env
- [ ] Storybook configuration includes pages directory
- [ ] Route works end-to-end (framework selection → skill selection → save)
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
- [ ] Storybook builds without errors (`pnpm build-storybook` succeeds)
