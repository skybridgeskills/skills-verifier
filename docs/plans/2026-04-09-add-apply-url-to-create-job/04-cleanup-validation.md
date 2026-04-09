# Phase 4: Cleanup & Validation

## Scope of phase

1. Search for any TODOs, debug prints, or temporary code
2. Run full validation (type checking, tests, linting)
3. Fix any warnings or errors
4. Create summary and move plan to done folder

## Cleanup

### Search for temporary code

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
grep -r "TODO\|FIXME\|console.log\|debugger" --include="*.ts" --include="*.svelte" src/routes/jobs/create src/lib/components/job-profile-form src/lib/server/domain/job
```

Expected: No matches (or only pre-existing ones unrelated to this change).

## Validate

Run full validation suite:

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
pnpm check
pnpm test
```

Expected:

- TypeScript compilation succeeds
- All tests pass
- No new linting errors introduced

## Final verification checklist

- [ ] `job-resource.ts` has `externalUrl: z.string().url().optional()`
- [ ] `JobProfileForm.svelte` has `externalUrl` state variable
- [ ] `JobProfileForm.svelte` has client-side URL validation
- [ ] `JobProfileForm.svelte` renders Apply URL input in both modes
- [ ] `+page.server.ts` parses `externalUrl` from form data
- [ ] `+page.server.ts` includes `externalUrl` in `CreateJobParams.safeParse()`
- [ ] `+page.server.ts` includes `externalUrl` in all error response `values`
- [ ] TypeScript compiles without errors
- [ ] Tests pass (if any exist for these components)

## Plan cleanup

Add a summary of the completed work to `docs/plans/2026-04-09-add-apply-url-to-create-job/summary.md`:

```markdown
# Summary: Add Apply URL to Create Job Page

## Changes Made

1. **Schema validation** (`src/lib/server/domain/job/job-resource.ts`)
   - Updated `externalUrl` from `z.string().optional()` to `z.string().url().optional()`
   - Provides server-side URL format validation

2. **JobProfileForm component** (`src/lib/components/job-profile-form/JobProfileForm.svelte`)
   - Added `externalUrl` to `JobProfileFormData` interface
   - Added state variable and error state for externalUrl
   - Added client-side URL validation (validates format and http/https protocol)
   - Added Apply URL input field in both embedded and non-embedded modes
   - Label: "Apply URL", Placeholder: "https://example.com/jobs/apply"

3. **Server action** (`src/routes/jobs/create/+page.server.ts`)
   - Parse `externalUrl` from form data
   - Include in `CreateJobParams.safeParse()` call
   - Include in all error response `values` for form repopulation

## Testing

- Client-side validation prevents submission of invalid URLs
- Server-side validation provides additional protection
- Optional field - can be left empty
- Form repopulation on error includes the externalUrl value
- Job detail page already displays the apply link (no changes needed)
```

## Move plan to done

After commit:

```bash
mkdir -p docs/plans-done
mv docs/plans/2026-04-09-add-apply-url-to-create-job docs/plans-done/
```

## Commit

Proposed commit message:

```
feat(jobs): add apply URL input to job creation form

Add an "Apply URL" input field to the CreateJobPage that allows users
to specify an external application link when creating a job.

Changes:
- Update JobResource schema to validate externalUrl as URL format
- Add externalUrl field to JobProfileForm with client-side validation
- Update create job server action to parse and validate externalUrl

Validation:
- Client-side: validates URL format and http/https protocol
- Server-side: uses Zod's .url() modifier for schema validation
- Field is optional - can be left empty
```
