# Phase 3: Update Server Action

## Scope of phase

Update the server-side form action in `+page.server.ts` to:

1. Parse the `externalUrl` field from the form data
2. Include it in the `CreateJobParams.safeParse()` call
3. Include it in error response values for form repopulation

## Code Organization Reminders

- Place new parsing logic with existing form field parsing (lines 36-40)
- Include `externalUrl` in all error response `values` objects for form repopulation
- Keep consistent with existing patterns for handling optional fields

## Style conventions

- Use `String(fd.get('fieldName') ?? '').trim()` pattern for string fields
- Use `|| undefined` to convert empty strings to undefined for optional fields
- Keep error response values in sync with form fields

## Implementation Details

### File: `src/routes/jobs/create/+page.server.ts`

#### 1. Add externalUrl parsing (after line 40)

```typescript
const externalUrl = String(fd.get('externalUrl') ?? '').trim() || undefined;
```

#### 2. Update error response values (lines 49, 57, 65, 72, 89)

Add `externalUrl` to all error response `values` objects:

**Line 49** (invalid skills payload):

```typescript
return fail(400, {
	error: 'Invalid skills payload',
	values: { name, company, description, externalUrl }
});
```

**Line 57** (invalid frameworks payload):

```typescript
return fail(400, {
	error: 'Invalid frameworks payload',
	values: { name, company, description, externalUrl }
});
```

**Line 65** (skills list parse failure):

```typescript
return fail(400, {
	error: 'Skills must be a valid list',
	values: { name, company, description, externalUrl }
});
```

**Line 72** (frameworks list parse failure):

```typescript
return fail(400, {
	error: 'Frameworks must be a valid list',
	values: { name, company, description, externalUrl }
});
```

#### 3. Update CreateJobParams.safeParse (lines 76-84)

Add `externalUrl` to the parsed object:

```typescript
const parsed = CreateJobParams.safeParse({
	externalId: `ext-${randomUUID()}`,
	externalUrl, // Add this line
	name,
	company,
	description,
	frameworks: frameworksList.data,
	skills: skillsList.data,
	status: 'active'
});
```

#### 4. Update final error response values (line 89)

```typescript
return fail(400, {
	error: first?.message ?? 'Invalid job data',
	values: { name, company, description, externalUrl }
});
```

## Validate

Run type checking and tests:

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier && pnpm check
```

Expected: No TypeScript errors. The action should compile and the `externalUrl` field should be properly typed.

## Test manually (optional)

After all phases are complete:

1. Navigate to `/jobs/create`
2. Fill in job name, company, description
3. Add at least one skill
4. Test Apply URL field:
   - Leave empty (should work - optional field)
   - Enter invalid URL like "not-a-url" (should show client-side error)
   - Enter relative URL like "/jobs/apply" (should show client-side error)
   - Enter valid URL like "https://example.com/jobs/apply" (should work)
   - Enter URL with non-http protocol like "ftp://example.com" (should show client-side error)
5. Submit form and verify job is created
6. Navigate to job detail page and verify Apply button appears
