# Design: Add Apply URL to Create Job Page

## Scope of work

Add an "Apply URL" input field to the CreateJobPage that allows users to specify an external application link when creating a job. This field already exists in the data model but is not currently editable during job creation.

**Requirements:**

1. Add an input field for "Apply URL" in the job creation form (label: "Apply URL", placeholder: "https://example.com/jobs/apply")
2. Client-side validation: ensure the URL is a valid absolute URL (http/https) if provided (field is optional)
3. Server-side validation: same validation rules as client-side using Zod's `z.string().url().optional()`
4. The URL should be persisted and displayed on the job detail page (already works)

## File structure

```
src/
├── lib/
│   ├── components/
│   │   └── job-profile-form/
│   │       ├── JobProfileForm.svelte          # UPDATE: Add externalUrl field + validation
│   │       └── JobProfileForm.stories.svelte  # UPDATE: Add externalUrl to stories
│   ├── pages/
│   │   ├── CreateJobPage.svelte               # UPDATE: Include externalUrl in form values
│   │   └── JobDetailPage.svelte               # NO CHANGE: Already displays externalUrl
│   └── server/
│       └── domain/
│           └── job/
│               └── job-resource.ts            # UPDATE: Add .url() to externalUrl schema
└── routes/
    └── jobs/
        └── create/
            └── +page.server.ts                 # UPDATE: Parse and pass externalUrl to CreateJobParams
```

## Conceptual architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CreateJobPage                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    JobProfileForm                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
│  │  │  Job Name   │  │   Company   │  │ Description │        │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Apply URL (optional)                               │  │  │
│  │  │  Placeholder: https://example.com/jobs/apply        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Client-side validation (URL format, optional)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  POST to ?/createJob                                    │    │
│  │  FormData: name, company, description, externalUrl       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    +page.server.ts                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Parse externalUrl from FormData                        │    │
│  │  Validate with CreateJobParams (Zod)                    │    │
│  │  externalUrl: z.string().url().optional()              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  createJobQuery(parsed.data)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JobDetailPage                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Display externalUrl as "Apply" button if present       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Main components and how they interact

1. **JobProfileForm.svelte** (UI Component)
   - Receives `initialData` prop including optional `externalUrl`
   - Adds new reactive state for `externalUrl` input
   - Adds client-side validation for URL format (optional field)
   - Renders input field with label "Apply URL" and placeholder
   - When `embedded=true`: renders fields only, parent form handles submit
   - When `embedded=false`: handles own submit with `onSubmit` callback

2. **CreateJobPage.svelte** (Page Component)
   - Uses `JobProfileForm` with `embedded` mode
   - No changes needed to form structure - `JobProfileForm` handles its own field names
   - Hidden inputs for `skillsJson` and `frameworksJson` remain unchanged
   - Form submits to `?/createJob` action

3. **+page.server.ts** (Server Action)
   - Parses `externalUrl` from FormData (new field)
   - Passes to `CreateJobParams.safeParse()` which validates via Zod
   - Already supported by schema - just need to include the value

4. **job-resource.ts** (Domain Schema)
   - Updates `externalUrl` from `z.string().optional()` to `z.string().url().optional()`
   - This provides server-side URL validation
   - `CreateJobParams` inherits this validation automatically

## Style conventions

From `docs/style/` and `AGENTS.md`:

- **ZodFactory for schemas**: Update `JobResource` to use `z.string().url().optional()` for `externalUrl`
- **Factory functions**: No new factories needed
- **Naming**: Use `camelCase` for variables/functions (`externalUrl`), `PascalCase` for types
- **File naming**: `kebab-case` for files
- **Svelte components**: PascalCase matching component name (`JobProfileForm.svelte`)
- **Organize by domain**: Changes within existing domain folders
- **Keep files small**: `JobProfileForm` is ~200 lines; if validation logic grows, extract to helper
- **Order by abstraction**: High-level logic (state, validation) first, helpers later
- **Validation**: Client-side in component, server-side via Zod schema

## Validation approach

**Client-side (JobProfileForm.svelte):**

```typescript
function validate(): boolean {
	// ... existing validation ...

	// Validate externalUrl if provided
	if (externalUrl.trim()) {
		try {
			const url = new URL(externalUrl.trim());
			if (url.protocol !== 'http:' && url.protocol !== 'https:') {
				externalUrlError = 'URL must start with http:// or https://';
				isValid = false;
			}
		} catch {
			externalUrlError = 'Please enter a valid URL';
			isValid = false;
		}
	}

	return isValid;
}
```

**Server-side (job-resource.ts + +page.server.ts):**

```typescript
// In job-resource.ts - already defined, just adding .url()
externalUrl: z.string().url().optional();

// In +page.server.ts - parse and include
const externalUrl = String(fd.get('externalUrl') ?? '').trim() || undefined;

const parsed = CreateJobParams.safeParse({
	externalId: `ext-${randomUUID()}`,
	externalUrl // now validated by Zod
	// ... other fields
});
```
