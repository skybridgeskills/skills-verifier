# Phase 5: Update SelectedSkillsColumn and SkillItem to Use shadcn Components

## Scope of Phase

Update two components:

- **SelectedSkillsColumn**: Replace native buttons with `<Button>` component, update empty state to use `<Card>`
- **SkillItem**: Replace native checkbox with `<Checkbox>` component

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Update SelectedSkillsColumn

#### Update Imports

Add imports for shadcn components:

```typescript
import { Button } from '$lib/components/ui/button/index.js';
import { Card, CardContent } from '$lib/components/ui/card/index.js';
import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
```

#### Replace Remove Buttons

Replace native remove buttons with `<Button>` components:

```svelte
<Button
	type="button"
	variant="ghost"
	size="icon"
	class="opacity-0 transition-opacity group-hover:opacity-100"
	onclick={() => onRemoveSkill(skill)}
	aria-label="Remove skill"
>
	<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
</Button>
```

#### Replace Warning Message

Replace custom warning div with `<Alert>` component:

```svelte
{#if showWarning}
	<Alert variant="default" class="border-yellow-300 bg-yellow-50">
		<AlertTitle class="text-yellow-800">
			You have selected {skillCount} skills
		</AlertTitle>
		<AlertDescription class="text-yellow-700">
			Consider focusing on the most important 5-10 skills for better clarity.
		</AlertDescription>
	</Alert>
{/if}
```

#### Replace Empty State

Replace custom empty state with `<Card>` component:

```svelte
{:else}
  <Card>
    <CardContent class="flex flex-col items-center justify-center p-8 text-center">
      <svg
        class="mx-auto h-12 w-12 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <!-- SVG path -->
      </svg>
      <p class="mt-2 text-sm text-muted-foreground">No skills selected yet</p>
      <p class="mt-1 text-xs text-muted-foreground">
        Select skills from the framework to add them here
      </p>
    </CardContent>
  </Card>
{/if}
```

#### Update Skill Display Cards

Update the skill display cards to use theme variables:

- Replace `border-gray-200` with `border-border`
- Replace `bg-white` with `bg-card`
- Replace `text-gray-900` with `text-foreground`
- Replace `text-gray-600` with `text-muted-foreground`
- Replace `hover:border-gray-300` with appropriate hover state

### Update SkillItem

#### Update Imports

Add imports for shadcn components:

```typescript
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { Label } from '$lib/components/ui/label/index.js';
```

#### Replace Checkbox

Replace native checkbox with `<Checkbox>` component:

```svelte
<Label
	class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors @md:p-4 {selected
		? 'border-primary bg-accent'
		: 'border-border bg-card hover:border-border'}"
>
	<Checkbox checked={selected} onCheckedChange={handleClick} class="mt-1" />
	<div class="flex-1">
		{#if skill.label && skill.text}
			<div class="font-medium text-foreground">{skill.label}</div>
			<div class="mt-1 text-sm text-muted-foreground">{skill.text}</div>
		{:else if skill.label}
			<div class="font-medium text-foreground">{skill.label}</div>
		{:else}
			<div class="text-foreground">{skill.text}</div>
		{/if}
	</div>
</Label>
```

Note: The `onCheckedChange` handler should call `onToggle(skill.url)`.

#### Theme Compatibility

Update all custom classes to use theme variables:

- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `bg-white` → `bg-card`
- `border-blue-500` → `border-primary`
- `bg-blue-50` → `bg-accent`

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Skill selection/deselection still works
- Remove buttons work correctly
- Warning message displays correctly
- Empty state displays correctly
- Checkbox styling is consistent
- Components render correctly in both light and dark modes
- Storybook stories still work
