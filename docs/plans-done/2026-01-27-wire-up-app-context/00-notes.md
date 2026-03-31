# Notes: Wire Up App Context

## Scope of Work

Wire up the app context system to:

1. Fix the build error where server-side code (`framework-client.ts`) is being imported in browser code (`+page.svelte`)
2. Set up `hooks.server.ts` similar to the reference project (`/Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/apps/tenant-home/src/hooks.server.ts`) to wire up app context for all requests
3. Support story-based contexts using AppContext factory functions (like `TestAppContext`)
4. Get the `CreateJobPage` story working with test data using the app context system
5. Move data fetching to server-side code (`+page.server.ts`) so components can access services via app context instead of props

## Current State

### App Context System

- ✅ `AppContext` interface exists in `src/lib/server/app-context.ts`
- ✅ `appContext()` and `getFrameworkClient()` in `app-context.ts`; ALS entry (`runInContext`, `runWithExtraContext`) lives in `util/provider/provider-ctx.ts` only
- ✅ `DevAppContext()` factory exists in `src/lib/server/dev-app-context.ts`
- ✅ `TestAppContext()` factory exists in `src/lib/server/test-app-context.ts`
- ✅ Context store uses async local storage via `UniversalAsyncLocalStore`

### Current Problem

- ❌ `src/routes/jobs/create/+page.svelte` imports `createFrameworkService` from server-side code, causing build error:
  ```
  Cannot import $lib/server/clients/framework-client/framework-client.ts into code that runs in the browser
  ```
- ❌ Components (`CreateJobPage`, `SkillsList`) receive `FrameworkClient` as props, which means they need server-side code passed down
- ✅ `hooks.server.ts` wraps requests with `DevAppContext()` via `runInContext`
- ❌ No `+page.server.ts` to load data server-side
- ❌ Stories don't use app context system

### Reference Implementation

- Reference project uses `hooks.server.ts` with `createHandleAppContext` utility
- Reference project uses `AppForStory` utility for story-based contexts
- Reference project passes `provideStoryTestApp` and `provideStoryTenantAdmin` to `AppForStory`
- Stories use `+page.server.ts` exports via `StoryArgs` helper

## Questions

### Q1: Should we create utilities similar to the reference project?

**Context**: The reference project uses utilities like `createHandleAppContext` and `AppForStory` from `@repo/lib-backend/util/svelte/`. These are likely shared utilities.

**Suggested Answer**: Yes, we should create simplified versions of these utilities in our codebase:

- `src/lib/server/util/svelte/create-handle-app-context.ts` - SvelteKit hook handler for app context
- `src/lib/server/util/svelte/app-for-story.ts` - Storybook helper for app context in stories
- Keep them simple and focused on our needs (no e2e support, no complex provider system)

**Answer**: Yes, create simplified versions in our codebase. ✅

### Q2: How should components access frameworkClient?

**Context**: Currently `CreateJobPage` and `SkillsList` receive `service: FrameworkClient` as props. With app context, they should access it via `appContext().frameworkClient`.

**Suggested Answer**:

- Remove `service` prop from components (`CreateJobPage`, `SkillsList`)
- Components call `appContext().frameworkClient` directly
- This requires components to run in a context (via `runInContext`), which will be set up in hooks/server code
- Update all component usages to remove the `service` prop

**Answer**: Remove `service` prop, components access `appContext().frameworkClient` directly. However, data needs to come from the server, so we need `+page.server.ts` to pass data around. ✅

### Q3: What should +page.server.ts export?

**Context**: In SvelteKit, `+page.server.ts` can export `load` function that runs server-side and provides data to `+page.svelte`. The reference project uses `StoryArgs` to extract these exports for stories.

**Suggested Answer**:

- For now, we don't need `+page.server.ts` to load data
- Components will fetch their own data using app context (e.g., `SkillsList` fetches skills when framework changes)
- The `load` function in `+page.server.ts` runs in app context automatically (via hooks), but we don't need to return data yet
- We can add `+page.server.ts` later if we need server-side data loading

**Answer**: Skip `+page.server.ts` for now. Components fetch their own data using app context.

### Q4: How should stories work with app context?

**Context**: Stories need to set up app context before rendering components. The reference uses `AppForStory` which takes providers and sets up context.

**Suggested Answer**:

- Create `AppForStory` utility that:
  - Takes an AppContext factory function (like `TestAppContext`)
  - Sets up the context using `runInContext` before rendering
  - Wraps the story component to ensure context is available
- Update `CreateJobPage.stories.svelte` to use `AppForStory` with `TestAppContext`
- The utility should handle async setup if needed

**Answer**: Create `AppForStory` utility that takes AppContext factory and sets up context for story rendering.

### Q5: Should we create a simplified version of the reference utilities?

**Context**: The reference project has complex utilities with providers, e2e support, etc. We may not need all that complexity.

**Suggested Answer**: Yes, create simplified versions that:

- `createHandleAppContext`: Takes `getAppContext` function (returns Promise<AppContext>), wraps SvelteKit handle to run requests in context
- `AppForStory`: Takes AppContext factory function, sets up context for story rendering
- Keep it simple - no providers, no e2e support, just the core functionality we need

**Answer**: Yes, create simplified versions focused on core functionality.
