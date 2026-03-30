# Phase 8: Integrate Dark Mode into Layout

## Scope of Phase

Update the root layout (`src/routes/+layout.svelte`) to:

- Initialize dark mode on page load
- Ensure the theme is applied before the page renders (prevent flash)
- Optionally add the ThemeToggle component to the layout

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Update +layout.svelte

Update `src/routes/+layout.svelte` to initialize dark mode. The current file should look like:

```svelte
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
```

Update it to:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Initialize theme before page renders to prevent flash
	onMount(() => {
		if (typeof window === 'undefined') return;

		const theme = localStorage.getItem('theme') || 'system';
		const html = document.documentElement;

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			if (systemTheme === 'dark') {
				html.classList.add('dark');
			} else {
				html.classList.remove('dark');
			}
		} else if (theme === 'dark') {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		// Prevent flash of unstyled content by setting theme immediately
		(function () {
			const theme = localStorage.getItem('theme') || 'system';
			const html = document.documentElement;
			if (theme === 'system') {
				const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
				if (systemTheme === 'dark') {
					html.classList.add('dark');
				}
			} else if (theme === 'dark') {
				html.classList.add('dark');
			}
		})();
	</script>
</svelte:head>

{@render children()}
```

### Explanation

1. **Inline Script in `<svelte:head>`**: This runs synchronously before the page renders, preventing a flash of light mode content when dark mode is preferred.

2. **onMount Hook**: This ensures the theme is properly initialized on the client side and handles any edge cases.

3. **Theme Logic**: The same logic as the ThemeToggle component - checks localStorage, falls back to system preference, and applies the `dark` class accordingly.

### Optional: Add ThemeToggle to Layout

If you want the theme toggle visible site-wide, you can add it to the layout. However, this is optional and can be done later based on design requirements.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Start the dev server and verify:

- No flash of unstyled content when loading the page
- Dark mode applies correctly based on saved preference
- System theme detection works
- Theme persists across page reloads
