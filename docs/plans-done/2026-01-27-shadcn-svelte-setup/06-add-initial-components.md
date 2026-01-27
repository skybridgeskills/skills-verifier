# Phase 6: Add Initial shadcn-svelte Components

## Scope of Phase

Add the initial set of shadcn-svelte components to verify the setup works correctly:

- Button
- Card
- Input
- Label
- Badge

These components will be installed using the shadcn-svelte CLI and will be placed in `src/lib/components/ui/`.

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
pnpm dlx shadcn-svelte@latest add button
pnpm dlx shadcn-svelte@latest add card
pnpm dlx shadcn-svelte@latest add input
pnpm dlx shadcn-svelte@latest add label
pnpm dlx shadcn-svelte@latest add badge
```

### Verify Component Structure

After installation, verify that each component has been created in `src/lib/components/ui/`:

- `src/lib/components/ui/button/` - Contains button.svelte and index.ts
- `src/lib/components/ui/card/` - Contains card.svelte, card-content.svelte, card-description.svelte, card-footer.svelte, card-header.svelte, card-title.svelte, and index.ts
- `src/lib/components/ui/input/` - Contains input.svelte and index.ts
- `src/lib/components/ui/label/` - Contains label.svelte and index.ts
- `src/lib/components/ui/badge/` - Contains badge.svelte and index.ts

### Test Component Import

Create a simple test to verify components can be imported. You can temporarily add a test import in an existing component or create a simple test file:

```typescript
import { Button } from '$lib/components/ui/button/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { Badge } from '$lib/components/ui/badge/index.js';
```

### Verify Component Dependencies

The CLI should have automatically installed any required dependencies (like `bits-ui`, `tailwind-variants`, etc.). Verify that `package.json` has been updated with these dependencies.

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
