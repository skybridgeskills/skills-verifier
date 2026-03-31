# Storybook Provider Context Integration

**Date:** 2026-03-30  
**Status:** Idea / Future Enhancement  
**Related:** tenant-home's `AppForStory` pattern

## Summary

Bring over the "provider-context-in-storybook" magic from tenant-home to allow stories to run with real server-side provider context (ALS) instead of manual prop-drilling.

## Current State

The skills-verifier repo already has:

- Provider core: `Providers()`, `runInContext()`, `providerCtx()` in `src/lib/server/util/provider/`
- Test factories: `TestAppContext`, `DevAppContext`
- Basic provider chains for time, id, and framework client services
- README.test.ts demonstrating provider patterns

Stories currently use **explicit prop-passing**:

```svelte
<Story name="Initial State">
	<CreateJobPage service={fakeService} />
</Story>
```

## What's Missing

The key piece from tenant-home is **`AppForStory`** — a helper that:

1. **Runs providers** via `runWithProvider` before stories render
2. **Creates reactive `$state`** for story args that syncs with server context
3. **Provides `beforeEach` hooks** for storybook to reset state between stories
4. **Bridges server `load` functions** into stories (if needed)

### Key Files to Reference (tenant-home)

| File                                                         | Purpose                                        |
| ------------------------------------------------------------ | ---------------------------------------------- |
| `packages/lib-util/src/util/provider/`                       | Core provider system (already have equivalent) |
| `packages/lib-backend/src/util/svelte/app-for-story.ts`      | **`AppForStory` helper** — the main bridge     |
| `packages/lib-backend/src/testing/provide-story-test-app.ts` | Test data providers for stories                |

### Tenant-Home Story Pattern

```typescript
// In a .stories.svelte file
const storyArgs = $state(StoryArgs(layoutServer));

const app = await AppForStory({
	provider: Providers(provideStoryTestApp, provideStoryTenantAdmin),
	pageServer: layoutServer, // Actual +page.server.ts module
	storyArgs,
	serverArgFn: async ({ locals }) => ({ locals, params: {} })
});

const { Story } = defineMeta({
	component: PageComponent,
	...app.storyMeta // Contains beforeEach hook for reset
});
```

## Estimated Implementation Effort

**Simplified version: 1-2 hours**

A minimal port would:

1. Add `withProviders` decorator to `.storybook/preview.ts`
2. Create basic `AppForStory` that wraps stories in `TestAppContext`
3. Keep reactive state bridge for args
4. Skip complex DB/auth/tenant mocking (not needed for this project)

**Full tenant-home parity: 4-8 hours**

Would require:

- Vite config updates for `$app/*` resolution in Storybook
- Page server mocking infrastructure
- Test data seeding helpers
- Responsive preview component

## When to Implement

Consider this enhancement when:

- [ ] Stories need to test actual `load` function behavior
- [ ] Multiple pages share complex server state
- [ ] Prop-drilling becomes unwieldy across many stories
- [ ] You want to test auth/context-dependent components without mocks

## Current Recommendation

**Keep the simple prop-based approach for now.** The current pattern is:

- Explicit and easy to understand
- Sufficient for the current component complexity
- Works without additional infrastructure

Revisit when the app grows to need:

- Authenticated story states
- Database-backed story data
- Complex page-level integration stories

## Related Files in This Repo

- `src/lib/server/util/provider/README.test.ts` — Provider system docs/tests
- `src/lib/server/test-app-context.ts` — Test context factory
- `.storybook/preview.ts` — Current preview config (no decorators)
