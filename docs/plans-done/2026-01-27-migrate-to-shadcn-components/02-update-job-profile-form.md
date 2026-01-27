# Phase 2: Update JobProfileForm to Use shadcn Components

## Scope of Phase

Update `JobProfileForm.svelte` to use shadcn-svelte components:

- Replace native `<input>` with `<Input>` component
- Replace native `<textarea>` with `<Textarea>` component
- Replace native `<label>` with `<Label>` component
- Replace native `<button>` with `<Button>` component
- Ensure error messages work with the new components
- Maintain all existing functionality and validation

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
import { Label } from '$lib/components/ui/label/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Textarea } from '$lib/components/ui/textarea/index.js';
```

### Replace Form Elements

1. **Name Field**:
   - Replace `<input>` with `<Input>`
   - Replace `<label>` with `<Label>`
   - Keep the error message display (can enhance with Alert later if needed)
   - Use `cn()` helper for conditional classes if needed

2. **Company Field**:
   - Replace `<input>` with `<Input>`
   - Replace `<label>` with `<Label>`
   - Keep error message display

3. **Description Field**:
   - Replace `<textarea>` with `<Textarea>`
   - Replace `<label>` with `<Label>`
   - Keep error message display

4. **Submit Button**:
   - Replace `<button>` with `<Button>`
   - Use variant="default" (default)
   - Keep the responsive width classes

### Error Handling

Keep the current error message display for now (inline text below fields). We can enhance with Alert components in a later phase if needed.

### Theme Compatibility

Ensure all custom classes use theme variables:

- Replace `text-gray-700` with `text-foreground` or `text-muted-foreground`
- Replace `text-red-500` with `text-destructive`
- Replace `text-red-600` with `text-destructive`
- Replace `border-gray-300` with `border-input` or `border-border`
- Replace `border-red-300` with `border-destructive`

### Example Structure

```svelte
<div>
	<Label for="job-name">
		Job Name <span class="text-destructive">*</span>
	</Label>
	<Input
		id="job-name"
		type="text"
		bind:value={name}
		required
		class={cn('mt-1', nameError ? 'border-destructive' : '')}
		placeholder="e.g., Senior Software Engineer"
	/>
	{#if nameError}
		<p class="mt-1 text-sm text-destructive">{nameError}</p>
	{/if}
</div>
```

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- Form still works correctly
- Validation still functions
- Error messages display properly
- Components render correctly in both light and dark modes
- Storybook story still works
