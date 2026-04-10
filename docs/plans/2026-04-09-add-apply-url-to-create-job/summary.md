# Summary: Add Apply URL to Create Job Page

## Completed work

1. **`src/lib/server/domain/job/job-resource.ts`**
   - `externalUrl` now uses `applyUrlSchema`: must parse as an absolute URL with `http:` or `https:` protocol when present; still optional.

2. **`src/lib/components/job-profile-form/JobProfileForm.svelte`**
   - Optional “Apply URL” field (`name="externalUrl"` in embedded mode), placeholder `https://example.com/jobs/apply`.
   - Client validation matches server: non-empty values must be valid absolute http(s) URLs.
   - Exported `validateEmbedded()` so the parent create-job form can run this validation on submit.

3. **`src/lib/pages/CreateJobPage.svelte`**
   - `bind:this` on `JobProfileForm`; `use:enhance` calls `validateEmbedded()` before skill count validation.
   - Form props include `externalUrl` in `values`; `initialData` passed from server `form.values` for repopulation on error.

4. **`src/routes/jobs/create/+page.server.ts`**
   - Reads `externalUrl` from `FormData` (empty → `undefined`), passes into `CreateJobParams.safeParse`, includes in all `fail(400, { values })` payloads.

5. **`src/lib/components/job-profile-form/JobProfileForm.stories.svelte`**
   - Submit handler type and alert text include optional `externalUrl`.

6. **`src/lib/server/domain/job/job-resource.test.ts`** (new)
   - Covers `CreateJobParams` for omitted URL, valid https, invalid string, and non-http(s) URL.

## Validation

- `pnpm check:typescript` — pass.
- `pnpm test:vitest` — all **server** tests pass (109). The workspace may still report exit code 1 if the Vitest browser/Playwright project cannot launch Chromium (install with `pnpm exec playwright install` if needed); not caused by this change.

## Follow-up (human)

- Review and commit with conventional message (see plan `04-cleanup-validation.md`).
- Optionally move this plan folder to `docs/plans-done/` after merge.
