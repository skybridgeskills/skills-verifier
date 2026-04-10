# Plan: Add Apply URL to Create Job Page

Date: 2026-04-09

## Scope of work

Add an "Apply URL" input field to the CreateJobPage that allows users to specify an external application link when creating a job. This field already exists in the data model (`externalUrl` in `JobResource`) and is displayed on the JobDetailPage, but it's not currently editable during job creation.

Requirements:

1. Add an input field for "Apply URL" in the job creation form
2. Client-side validation: ensure the URL is absolute (has protocol + host) if provided (field is optional)
3. Server-side validation: same validation rules as client-side
4. The URL should be persisted and displayed on the job detail page (this already works)

## Current state of the codebase

**Existing data model (`src/lib/server/domain/job/job-resource.ts`):**

- `JobResource` already includes `externalUrl: z.string().optional()`
- `CreateJobParams` already includes `externalUrl: JobResource.schema.shape.externalUrl`

**Current CreateJobPage (`src/lib/pages/CreateJobPage.svelte`):**

- Uses `JobProfileForm` component embedded in a form
- Form submits to `?/createJob` action
- Currently captures: `name`, `company`, `description`, `skillsJson`, `frameworksJson`
- Missing: `externalUrl` (apply URL)

**Current JobProfileForm (`src/lib/components/job-profile-form/JobProfileForm.svelte`):**

- Has fields for: `name`, `company`, `description`
- Has client-side validation for required fields
- Missing: `externalUrl` field and validation

**Server-side action (`src/routes/jobs/create/+page.server.ts`):**

- Parses form data for `name`, `company`, `description`, `skillsJson`, `frameworksJson`
- Validates skills and frameworks with Zod schemas
- Calls `CreateJobParams.safeParse()` which already supports `externalUrl`
- Missing: parsing and validation of `externalUrl` from form data

**JobDetailPage (`src/lib/pages/JobDetailPage.svelte`):**

- Already displays the apply link if `job.externalUrl` is present (lines 47-62)

## Questions

### Question 1: Label and placeholder text ✓ ANSWERED

**Answer:** Option A - Label = "Apply URL", Placeholder = "https://example.com/jobs/apply"

### Question 2: Validation strictness ✓ ANSWERED

**Answer:** Option A - Must be a valid absolute URL with http:// or https:// protocol (using Zod's `z.string().url()`)

**Decision:** Will update the `JobResource` schema to use `z.string().url().optional()` for better validation across the board.

### Question 3: Where to add the field ✓ ANSWERED

**Answer:** Option A - Add to `JobProfileForm`

**Decision:** Will add the apply URL field to `JobProfileForm` since it's already the component responsible for job profile fields, and the `externalUrl` is part of the job profile. The field can be optional and won't break existing usages.

## Style conventions (for this plan)

From `docs/style/README.md` and `AGENTS.md`:

- **ZodFactory for schemas**: Update `JobResource` schema to use `z.string().url().optional()` for `externalUrl`
- **Factory functions**: Use existing patterns; no new factories needed
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for types
- **File naming**: `kebab-case` for files, co-located tests as `<file>.test.ts`
- **Svelte components**: PascalCase matching component name
- **Organize by domain**: Changes within existing domain folders (`job/`, `job-profile-form/`)
- **Keep files small**: `JobProfileForm` is ~200 lines, consider extracting validation helpers if growing
- **Order by abstraction**: High-level logic first, helpers later

## Notes

- The `externalUrl` field is already in the database schema (via `JobResource` and `CreateJobParams`)
- The field is already displayed on the job detail page
- Only need to: (1) add input field, (2) add client-side validation, (3) add server-side parsing/validation
