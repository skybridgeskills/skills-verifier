# Phase 3: ResponsivePreview + Stories

## Scope

Add `fluid` prop to `ResponsivePreview` and update CreateJobPage stories.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style Conventions

- Tailwind utility classes
- camelCase props
- TSDoc for new public props

## Implementation Details

### 1. ResponsivePreview — Add `fluid` prop

In `src/lib/storybook/responsive-preview.svelte`:

**Before:**

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Viewport width; container queries (`@lg:` etc.) resolve against this box. */
		width?: number;
		/** Banner label; defaults to `Preview ({width}px)`. */
		label?: string;
		children: Snippet;
	}

	let { width = 375, label, children }: Props = $props();

	const banner = $derived(label ?? `Preview (${width}px)`);
</script>

<div
	class="@container box-content overflow-x-auto rounded border-2 border-border bg-background"
	style:width="{width}px"
	style:max-width="min(100%, {width}px)"
>
	<div class="bg-muted px-2 py-1 text-xs font-medium text-foreground">{banner}</div>
	<div class="p-2">
		{@render children()}
	</div>
</div>
```

**After:**

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Viewport width; container queries (`@lg:` etc.) resolve against this box. */
		width?: number;
		/** Fill available space while guaranteeing min-width for container queries. */
		fluid?: boolean;
		/** Banner label; defaults to `Preview ({width}px)` or `Preview (≥{width}px)`. */
		label?: string;
		children: Snippet;
	}

	let { width = 375, fluid = false, label, children }: Props = $props();

	const banner = $derived(label ?? (fluid ? `Preview (≥${width}px)` : `Preview (${width}px)`));
</script>

<div
	class="@container box-content overflow-x-auto rounded border-2 border-border bg-background"
	style:width={fluid ? '100%' : `${width}px`}
	style:min-width={fluid ? `${width}px` : undefined}
	style:max-width={fluid ? undefined : `min(100%, ${width}px)`}
>
	<div class="bg-muted px-2 py-1 text-xs font-medium text-foreground">{banner}</div>
	<div class="p-2">
		{@render children()}
	</div>
</div>
```

When `fluid` is true:

- `width: 100%` — fills available Storybook canvas
- `min-width: {width}px` — guarantees the container query breakpoint fires
- No `max-width` — can grow beyond `width`

### 2. CreateJobPage stories — Use fluid for desktop

In `src/lib/pages/CreateJobPage.stories.svelte`:

Update desktop stories to use `fluid`:

```svelte
<Story name="Initial State (desktop width)">
	<ResponsivePreview width={1100} fluid label="Desktop — sidebar visible @5xl">
		<CreateJobPage />
	</ResponsivePreview>
</Story>

<Story name="With form error">
	<ResponsivePreview width={1100} fluid>
		<CreateJobPage
			form={{ error: 'Example server validation message', values: { name: '', company: '' } }}
		/>
	</ResponsivePreview>
</Story>

<Story name="With selections">
	<ResponsivePreview width={1100} fluid>
		<CreateJobPage initialSelectedSkills={withSelections} />
	</ResponsivePreview>
</Story>
```

Keep the mobile story as-is (fixed width, no fluid):

```svelte
<Story name="Mobile (add-skills entry)">
	<ResponsivePreview width={375} label="Mobile — Add skills opens dialog">
		<CreateJobPage />
	</ResponsivePreview>
</Story>
```

### 3. SkillSearch stories — Verify

Existing SkillSearch stories should still work since `picks` defaults to `[]`. The empty state falls back to the "Search to find..." text when no picks are available.

Optionally add a story that passes `QUICK_PICKS` to show the new quick-pick empty state behavior.

## Validate

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
pnpm turbo check
pnpm turbo test
```

Verify:

- Desktop stories fill the Storybook canvas and show sidebar
- Mobile story still shows fixed-width view with dialog trigger
- No regressions in other stories using ResponsivePreview (fluid defaults to false)
