# Phase 7: Update Card.stories.svelte and Remove Old Card Component

## Scope of Phase

- Update `Card.stories.svelte` to use shadcn Card components instead of the custom Card
- Remove the old custom Card component (`src/lib/components/card/Card.svelte`)
- Ensure Storybook stories demonstrate shadcn Card usage properly

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Update Card.stories.svelte

Replace the import and update stories to use shadcn Card components:

```svelte
<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
</script>
```

Update stories to demonstrate shadcn Card structure:

```svelte
<Story name="Default">
	<Card>
		<CardHeader>
			<CardTitle>Card Title</CardTitle>
			<CardDescription>Card description goes here</CardDescription>
		</CardHeader>
		<CardContent>
			<p>Card content goes here.</p>
		</CardContent>
	</Card>
</Story>

<Story name="With Footer">
	<Card>
		<CardHeader>
			<CardTitle>Card with Footer</CardTitle>
		</CardHeader>
		<CardContent>
			<p>Card content with a footer below.</p>
		</CardContent>
		<CardFooter>
			<Button>Action</Button>
		</CardFooter>
	</Card>
</Story>

<Story name="Multiple Cards">
	<div class="grid grid-cols-1 gap-4 @md:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Card 1</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Content for card 1</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Card 2</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Content for card 2</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Card 3</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Content for card 3</p>
			</CardContent>
		</Card>
	</div>
</Story>
```

### Remove Old Card Component

Delete the old Card component file:

```bash
rm src/lib/components/card/Card.svelte
```

### Verify No Other References

Search for any remaining references to the old Card component:

```bash
grep -r "from.*card/Card" src/
grep -r "import.*Card.*from.*components/card" src/
```

If any references are found, update them to use the shadcn Card from `$lib/components/ui/card`.

### Update Directory Structure

The `src/lib/components/card/` directory will now only contain `Card.stories.svelte`. This is fine - Storybook stories can live alongside where the component used to be, or we could move it. For now, we'll leave it as-is.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Storybook stories compile correctly
- Card stories display properly in Storybook
- No broken imports or references
- All TypeScript checks pass
