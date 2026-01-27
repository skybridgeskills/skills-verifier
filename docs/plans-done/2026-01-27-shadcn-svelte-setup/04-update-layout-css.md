# Phase 4: Update layout.css with Theme Variables and Plugins

## Scope of Phase

Update `src/routes/layout.css` to:

- Ensure all Tailwind plugins are properly configured (@tailwindcss/typography, @tailwindcss/forms, @iconify/tailwind4)
- Add the custom dark mode variant for Tailwind v4
- Ensure theme variables are properly set up for Zinc color scheme
- Add the @theme inline directive for Tailwind v4
- Import tw-animate-css for animations

The CLI in Phase 3 will have added theme variables, but we need to ensure everything is properly configured for Tailwind v4.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Expected layout.css Structure

The `src/routes/layout.css` file should have the following structure:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@plugin '@tailwindcss/typography';
@plugin '@tailwindcss/forms';
@plugin '@iconify/tailwind4';

@custom-variant dark (&&:is(.dark *));

:root {
	/* Light mode CSS variables - Zinc color scheme */
	--background: hsl(0 0% 100%);
	--foreground: hsl(240 5.9% 10%);
	/* ... other theme variables ... */
}

.dark {
	/* Dark mode CSS variables - Zinc color scheme */
	--background: hsl(240 10% 3.9%);
	--foreground: hsl(0 0% 98%);
	/* ... other theme variables ... */
}

@theme inline {
	/* Theme configuration for Tailwind v4 */
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);

	/* Color mappings */
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	/* ... other color mappings ... */
}

@layer base {
	* {
		@apply border-border;
	}
	body {
		@apply bg-background text-foreground;
	}
}
```

### Steps

1. **Verify Plugin Imports**: Ensure all three plugins are present:
   - `@tailwindcss/typography`
   - `@tailwindcss/forms`
   - `@iconify/tailwind4`

2. **Add tw-animate-css Import**: Add `@import 'tw-animate-css';` after the tailwindcss import

3. **Add Dark Mode Variant**: Add `@custom-variant dark (&&:is(.dark *));` for Tailwind v4 dark mode support

4. **Verify Theme Variables**: The CLI should have added Zinc color scheme variables. Verify they're present in both `:root` and `.dark` selectors

5. **Verify @theme inline**: Ensure the `@theme inline` directive is present with proper color mappings

6. **Verify Base Layer**: Ensure the base layer styles are present for border and body styling

### Color Scheme Reference

The Zinc color scheme variables should match shadcn-svelte's Zinc theme. The CLI should have generated these automatically, but verify they're using HSL format and Zinc color values.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Start the dev server and verify:

- No console errors
- Styles are applying correctly
- Dark mode CSS variables are present (even if toggle isn't working yet)
