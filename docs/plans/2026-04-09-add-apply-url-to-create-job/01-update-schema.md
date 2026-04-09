# Phase 1: Update Job Resource Schema

## Scope of phase

Update the `JobResource` schema to add URL validation to the `externalUrl` field using Zod's `.url()` modifier. This ensures server-side validation of the apply URL format.

## Code Organization Reminders

- Keep related validation logic in the schema file
- Use ZodFactory patterns consistently
- File size is small (~77 lines), no extraction needed

## Style conventions

- Use `ZodFactory` for schema definitions
- Keep runtime validation and TypeScript types in sync
- Use `.url()` for URL validation on `z.string()`

## Implementation Details

### File: `src/lib/server/domain/job/job-resource.ts`

Update line 51 from:

```typescript
externalUrl: z.string().optional(),
```

To:

```typescript
externalUrl: z.string().url().optional(),
```

This single change:

1. Validates that if `externalUrl` is provided, it must be a valid URL format
2. `CreateJobParams` inherits this validation automatically since it references `JobResource.schema.shape.externalUrl`
3. Maintains optional semantics (field can still be omitted or empty)

## Validate

Run type checking to ensure the schema change is valid:

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier && pnpm check
```

Expected: No TypeScript errors. The `.url()` modifier is a standard Zod feature.
