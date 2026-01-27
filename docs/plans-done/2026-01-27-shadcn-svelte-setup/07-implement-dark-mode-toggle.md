# Phase 7: Implement Dark Mode Toggle Component

## Scope of Phase

Create a dark mode toggle component that allows users to switch between light and dark themes. The component will:

- Read/write theme preference to localStorage
- Detect system preference
- Toggle the `dark` class on the `<html>` element
- Provide a user-friendly interface (button or switch)

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Create Theme Toggle Component

Create `src/lib/components/theme-toggle/ThemeToggle.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	type Theme = 'light' | 'dark' | 'system';

	let currentTheme = $state<Theme>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');

	function getSystemTheme(): 'light' | 'dark' {
		if (typeof window === 'undefined') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(theme: 'light' | 'dark') {
		if (typeof document === 'undefined') return;
		const html = document.documentElement;
		if (theme === 'dark') {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
		resolvedTheme = theme;
	}

	function setTheme(theme: Theme) {
		currentTheme = theme;
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', theme);
		}

		if (theme === 'system') {
			const systemTheme = getSystemTheme();
			applyTheme(systemTheme);
		} else {
			applyTheme(theme);
		}
	}

	function toggleTheme() {
		if (currentTheme === 'light') {
			setTheme('dark');
		} else if (currentTheme === 'dark') {
			setTheme('system');
		} else {
			setTheme('light');
		}
	}

	onMount(() => {
		// Load saved theme or default to system
		const savedTheme = (
			typeof window !== 'undefined' ? localStorage.getItem('theme') : null
		) as Theme | null;

		const initialTheme: Theme = savedTheme || 'system';
		setTheme(initialTheme);

		// Listen for system theme changes
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = () => {
				if (currentTheme === 'system') {
					applyTheme(getSystemTheme());
				}
			};
			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
		}
	});
</script>

<Button variant="outline" size="icon" onclick={toggleTheme} aria-label="Toggle theme">
	{#if resolvedTheme === 'dark'}
		<!-- Sun icon for switching to light -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="4"></circle>
			<path d="M12 2v2"></path>
			<path d="M12 20v2"></path>
			<path d="m4.93 4.93 1.41 1.41"></path>
			<path d="m17.66 17.66 1.41 1.41"></path>
			<path d="M2 12h2"></path>
			<path d="M20 12h2"></path>
			<path d="m6.34 17.66-1.41 1.41"></path>
			<path d="m19.07 4.93-1.41 1.41"></path>
		</svg>
	{:else}
		<!-- Moon icon for switching to dark -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
		</svg>
	{/if}
</Button>
```

### Create Index File

Create `src/lib/components/theme-toggle/index.ts`:

```typescript
export { default as ThemeToggle } from './ThemeToggle.svelte';
```

### Component Behavior

The component cycles through three states:

1. **Light** → Click → **Dark**
2. **Dark** → Click → **System** (follows OS preference)
3. **System** → Click → **Light**

The component:

- Persists the preference in localStorage
- Applies the theme immediately
- Listens to system theme changes when in "system" mode
- Shows appropriate icons (sun/moon) based on resolved theme

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Verify that:

- The component compiles without errors
- The dark class is added/removed from `<html>` correctly
- Theme preference persists in localStorage
- System theme detection works
