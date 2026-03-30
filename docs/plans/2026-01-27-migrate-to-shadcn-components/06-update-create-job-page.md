# Phase 6: Update CreateJobPage to Use shadcn Alert

## Scope of Phase

Update `CreateJobPage.svelte` to use shadcn-svelte `<Alert>` components for success and error messages:

- Replace custom success message div with `<Alert>` component
- Replace custom error message div with `<Alert>` component
- Ensure all text colors use theme variables for dark mode compatibility
- Maintain all existing functionality

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Update Imports

Add imports for shadcn components:

```typescript
import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
```

### Replace Success Message

Replace custom success message div with `<Alert>` component:

```svelte
{#if showSuccess}
	<Alert variant="default" class="border-green-300 bg-green-50">
		<AlertTitle class="text-green-800">Job profile saved successfully!</AlertTitle>
	</Alert>
{/if}
```

Note: shadcn-svelte Alert doesn't have a built-in "success" variant, so we'll use the default variant with custom green styling. Alternatively, we could create a custom success variant or use a different approach.

### Replace Error Message

Replace custom error message div with `<Alert>` component:

```svelte
{#if validationError}
	<Alert variant="destructive">
		<AlertTitle>Validation Error</AlertTitle>
		<AlertDescription>{validationError}</AlertDescription>
	</Alert>
{/if}
```

### Update Page Text Colors

Ensure all text colors use theme variables:

- Replace `text-gray-900` with `text-foreground`
- Replace `text-gray-600` with `text-muted-foreground`
- Keep heading styles but ensure they use theme variables

### Theme Compatibility

Update all custom classes to use theme variables:

- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`

The page structure and layout can remain the same, but ensure all colors are theme-aware.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Success message displays correctly
- Error message displays correctly
- All text is readable in both light and dark modes
- Page layout remains intact
- All functionality still works
- Storybook story still works
