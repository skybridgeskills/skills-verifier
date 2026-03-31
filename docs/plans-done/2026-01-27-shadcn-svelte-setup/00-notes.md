# shadcn-svelte Setup Plan

## Scope of Work

Set up shadcn-svelte with basic components and required plugins/utilities according to `architecture.md`:

- Install and configure shadcn-svelte CLI and core dependencies
- Install required utilities: `clsx`, `tailwind-merge`
- Install Tailwind plugins: `@tailwindcss/forms`
- Install icon system: `@iconify/tailwind4` and basic icon sets
- Initialize shadcn-svelte configuration (`components.json`)
- Add a few basic components to verify setup (e.g., Button, Card, Input)
- Ensure compatibility with existing Tailwind v4 setup

## Current State

### Already Configured

- ✅ Tailwind CSS v4 (`tailwindcss@^4.1.17`) via `@tailwindcss/vite`
- ✅ `@tailwindcss/typography` plugin installed and configured
- ✅ Tailwind configured in `src/routes/layout.css` with `@import 'tailwindcss'` and `@plugin '@tailwindcss/typography'`
- ✅ SvelteKit project with Svelte 5
- ✅ TypeScript configured
- ✅ Path aliases configured (`$lib`)

### Not Yet Installed/Configured

- ❌ `shadcn-svelte` CLI and dependencies
- ❌ `clsx` (class name management)
- ❌ `tailwind-merge` (merge Tailwind classes)
- ❌ `@tailwindcss/forms` plugin
- ❌ `@iconify/tailwind4` (icon system)
- ❌ `@iconify-json/*` icon sets
- ❌ `components.json` configuration file
- ❌ shadcn-svelte utility functions (`cn` helper)
- ❌ Basic shadcn-svelte components

### Existing Components

The project has custom components in `src/lib/components/`:

- `card/` - Custom Card component
- `framework-selector/`
- `job-profile-form/`
- `selected-skills-column/`
- `skill-item/`
- `skills-list/`

These are custom implementations and should coexist with shadcn-svelte components.

## Questions

### Q1: Which base color scheme should we use?

**Context**: shadcn-svelte supports multiple base color schemes (Slate, Gray, Zinc, Neutral, Stone, etc.). The default is Slate.

**Answer**: Use Zinc as the base color scheme.

### Q2: Should we install @tailwindcss/forms plugin?

**Context**: According to `architecture.md`, `@tailwindcss/forms` is listed as a required plugin. This plugin provides better default styling for form elements. It's compatible with shadcn-svelte (which styles its own components) and useful for native HTML form elements.

**Answer**: Yes, install and configure `@tailwindcss/forms` as specified in architecture.md.

### Q3: Which icon sets should we install?

**Context**: `architecture.md` mentions `@iconify-json/*` with examples: `material-symbols-light`, `mdi-light`, `ic`. We need to decide which icon sets to include initially.

**Answer**: Install `@iconify-json/material-symbols-light` and `@iconify-json/mdi-light` as a starting point. These are commonly used and provide good coverage. More icon sets can be added later as needed.

### Q4: Which shadcn-svelte components should we install initially?

**Context**: We want to verify the setup works and provide some basic components. We should install a small set of commonly used components.

**Answer**: Install Button, Card, Input, Label, and Badge as initial components. These are fundamental and will help verify the setup. More components can be added later as needed.

### Q5: Should we replace the existing Card component with shadcn-svelte's Card?

**Context**: There's already a custom `Card` component in `src/lib/components/card/`. shadcn-svelte will create components in `src/lib/components/ui/`.

**Answer**: Keep the existing custom Card component for now. shadcn-svelte components will be in `src/lib/components/ui/` and won't conflict. The existing components can continue to be used, and we can update/migrate to shadcn-svelte components later as needed.

### Q6: Should we set up dark mode support?

**Context**: shadcn-svelte supports dark mode, but it requires additional setup. The architecture.md doesn't explicitly mention dark mode.

**Answer**: Yes, set up full dark mode support including CSS variables, theme structure, and a toggle mechanism. This will allow users to switch between light and dark modes.

### Q7: Should we update the existing layout.css file or create a new one?

**Context**: shadcn-svelte CLI will ask for the global CSS file location and may overwrite it. Currently, `src/routes/layout.css` contains Tailwind imports.

**Answer**: Use `src/routes/layout.css` as the global CSS file. The CLI will add the necessary CSS variables and theme configuration. We'll need to ensure it preserves the existing `@tailwindcss/typography` plugin import and adds the new `@tailwindcss/forms` plugin.
