# Phase 3: Update FrameworkSelector to Use shadcn Components

## Scope of Phase

Update `FrameworkSelector.svelte` to use shadcn-svelte components:

- Replace native `<input>` with `<Input>` component for search
- Replace native `<button>` with `<Button>` component for framework selection
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
import { Button } from '$lib/components/ui/button/index.js';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
```

### Replace Search Input

Replace the native search input:

```svelte
<Input
	id="framework-search"
	type="text"
	bind:value={searchQuery}
	placeholder="Search by framework name or organization..."
	disabled={loading}
/>
```

### Replace Framework Selection Buttons

Replace native buttons with `<Button>` components:

```svelte
<Button
	type="button"
	variant="outline"
	class="w-full justify-start text-left"
	onclick={() => handleSelect(framework)}
>
	<div class="font-medium">{framework.name}</div>
	<div class="mt-1 text-sm text-muted-foreground">{framework.organization}</div>
</Button>
```

### Replace Loading Skeletons

Replace custom loading skeletons with `<Skeleton>` components:

```svelte
{#if loading}
	<div class="space-y-3">
		{#each Array.from({ length: 2 }, (_, i) => i) as i (i)}
			<div class="space-y-2 rounded-lg border p-4">
				<Skeleton class="h-5 w-3/4" />
				<Skeleton class="h-4 w-1/2" />
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
		<AlertTitle>Error loading framework</AlertTitle>
		<AlertDescription>{error}</AlertDescription>
	</Alert>
{/if}
```

### Replace Empty States

Keep empty states but ensure they use theme variables:

- Replace `text-gray-600` with `text-muted-foreground`
- Replace `border-gray-200` with `border-border`
- Replace `bg-gray-50` with `bg-muted`

### Theme Compatibility

Update all custom classes to use theme variables:

- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `bg-white` → `bg-card` or `bg-background`
- `bg-blue-50` → Use Button's hover state instead
- `border-blue-500` → Use Button's focus state instead

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Search functionality still works
- Framework selection still works
- Loading states display correctly
- Error messages display correctly
- Empty states display correctly
- Components render correctly in both light and dark modes
- Storybook story still works
