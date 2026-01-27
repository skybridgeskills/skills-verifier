# Phase 4: Update SkillsList to Use shadcn Components

## Scope of Phase

Update `SkillsList.svelte` to use shadcn-svelte components:

- Replace native `<input>` with `<Input>` component for search
- Replace custom loading skeletons with `<Skeleton>` component
- Replace custom error message with `<Alert>` component
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
import { Input } from '$lib/components/ui/input/index.js';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
import { Button } from '$lib/components/ui/button/index.js';
```

### Replace Search Input

Replace the native search input:

```svelte
<Input id="skill-search" type="text" bind:value={searchQuery} placeholder="Search skills..." />
```

### Replace Loading Skeletons

Replace custom loading skeletons with `<Skeleton>` components for both framework and skills loading:

**Framework Loading**:

```svelte
{#if loadingFramework}
	<div class="space-y-3">
		{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
			<div class="space-y-2 rounded-lg border p-4">
				<Skeleton class="h-5 w-3/4" />
				<Skeleton class="h-4 w-1/2" />
			</div>
		{/each}
	</div>
{/if}
```

**Skills Loading**:

```svelte
{#if loadingSkills}
	<div class="space-y-3">
		{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
			<div class="flex items-start gap-3 rounded-lg border p-3">
				<Skeleton class="mt-1 h-4 w-4 rounded" />
				<div class="flex-1 space-y-2">
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			</div>
		{/each}
	</div>
{/if}
```

### Replace Error Message

Replace custom error div with `<Alert>` component:

```svelte
{#if error}
	<Alert variant="destructive">
		<AlertTitle>Error loading skills</AlertTitle>
		<AlertDescription>{error}</AlertDescription>
		{#if framework}
			<Button type="button" variant="outline" size="sm" class="mt-3" onclick={handleRetry}>
				Retry
			</Button>
		{/if}
	</Alert>
{/if}
```

### Replace Empty States

Update empty states to use theme variables:

- Replace `text-gray-600` with `text-muted-foreground`
- Replace `border-gray-200` with `border-border`
- Replace `bg-gray-50` with `bg-muted`

### Update Selection Count Display

Ensure selection count uses theme variables:

- Replace `text-gray-600` with `text-muted-foreground`

### Theme Compatibility

Update all custom classes to use theme variables:

- `text-gray-600` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `bg-gray-100` → `bg-muted`
- `bg-gray-300` → `bg-muted` (for skeleton backgrounds)
- `bg-white` → `bg-card` or `bg-background`

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Search functionality still works
- Loading states display correctly (both framework and skills)
- Error messages display correctly with retry button
- Empty states display correctly
- Selection count displays correctly
- Components render correctly in both light and dark modes
- Storybook story still works
