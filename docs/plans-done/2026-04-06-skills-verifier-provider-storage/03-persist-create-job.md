# Phase 3: Persist create job

## Scope of phase

Wire **job creation** from the UI to the server using SvelteKit **form actions** (or equivalent), calling `**createJobQuery`** inside the action with `**appContext()**`/`runInContext`already established by`handle`. Align payload with domain `**CreateJobParams**`: `**frameworks` optional** (default empty array), **skills\*\* required per product rules.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later.

## Implementation Details

**Domain / validation**

- `[src/lib/server/domain/job/job-resource.ts](../../../src/lib/server/domain/job/job-resource.ts)` — ensure `CreateJobParams` treats `frameworks` as optional with `.default([])` if not already, so server actions do not require the client to send frameworks.
- Reuse Zod parsing on the server for the action body (either `CreateJobParams.safeParse` or a dedicated action schema that maps form fields).

**New / updated routes**

- Add `[src/routes/jobs/create/+page.server.ts](../../../src/routes/jobs/create/+page.server.ts)`:
  - `actions.default`: parse `request.formData()` or JSON; validate; `await createJobQuery(parsed)`; `redirect` to list or return `fail(400, { errors })` on validation errors.
  - Optional `load` to pass flash messages or empty defaults.

**UI**

- Update `[src/lib/pages/CreateJobPage.svelte](../../../src/lib/pages/CreateJobPage.svelte)` (and/or `[src/routes/jobs/create/+page.svelte](../../../src/routes/jobs/create/+page.svelte)`) to use `<form method="POST" … use:enhance>` or progressive enhancement as the project already prefers.
- Map selected skills to the shape expected by `SkillResource` (url, text, ctid, optional label).
- **Remove** the requirement to select a framework before submit (phase 5 can polish copy); at minimum do not block submit on `selectedFramework` if `frameworks` defaults to `[]`.

**Error handling**

- Surface server validation errors in the form (SvelteKit `ActionData` pattern).

**Tests**

- Add a focused test: `runInContext` + `TestAppContext`, POST-shaped data or direct `createJobQuery` call — or a small `+page.server.ts` test if the project uses that pattern. At least one test proving a created job appears in `listActiveJobsQuery` or `jobByIdQuery`.

## Validate

```bash
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
pnpm exec eslint .
```

Manual: submit the create form; confirm job persists (same server process) and survives navigation.
