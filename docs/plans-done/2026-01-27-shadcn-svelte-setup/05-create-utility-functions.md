# Phase 5: Create Utility Functions (cn helper)

## Scope of Phase

Create the `src/lib/utils.ts` file with the `cn()` utility function that combines `clsx` and `tailwind-merge`. This function is essential for shadcn-svelte components to properly merge Tailwind classes.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Create utils.ts

Create `src/lib/utils.ts` with the following content:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Explanation

- `clsx`: Handles conditional class names and arrays/objects of classes
- `twMerge`: Intelligently merges Tailwind classes, resolving conflicts (e.g., if both `p-2` and `p-4` are present, it keeps `p-4`)
- `cn`: Combines both utilities for optimal class name handling

### Type Safety

The function uses TypeScript types from `clsx` (`ClassValue`) to ensure type safety when passing class names.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- The file compiles without TypeScript errors
- The function can be imported: `import { cn } from '$lib/utils';`
- No linting errors
