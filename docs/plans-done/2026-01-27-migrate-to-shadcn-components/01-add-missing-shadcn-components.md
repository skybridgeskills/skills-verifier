# Phase 1: Add Missing shadcn Components

## Scope of Phase

Add the missing shadcn-svelte components needed for the migration:

- Textarea - for JobProfileForm description field
- Alert - for success/error messages
- Checkbox - for SkillItem component
- Skeleton - for loading states

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Install Components

Use the shadcn-svelte CLI to add each component:

```bash
pnpm dlx shadcn-svelte@latest add textarea
pnpm dlx shadcn-svelte@latest add alert
pnpm dlx shadcn-svelte@latest add checkbox
pnpm dlx shadcn-svelte@latest add skeleton
```

### Verify Component Structure

After installation, verify that each component has been created in `src/lib/components/ui/`:

- `src/lib/components/ui/textarea/` - Contains textarea.svelte and index.ts
- `src/lib/components/ui/alert/` - Contains alert.svelte, alert-title.svelte, alert-description.svelte, and index.ts
- `src/lib/components/ui/checkbox/` - Contains checkbox.svelte and index.ts
- `src/lib/components/ui/skeleton/` - Contains skeleton.svelte and index.ts

### Test Component Imports

Verify components can be imported:

```typescript
import { Textarea } from '$lib/components/ui/textarea/index.js';
import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
```

### Verify Component Dependencies

The CLI should have automatically installed any required dependencies. Verify that `package.json` has been updated with these dependencies.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- All components compile without errors
- Components can be imported successfully
- No missing dependencies
- TypeScript types are correct
