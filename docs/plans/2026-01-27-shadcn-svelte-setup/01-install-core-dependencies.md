# Phase 1: Install Core Dependencies and Utilities

## Scope of Phase

Install the core dependencies required for shadcn-svelte setup:

- `clsx` - Class name utility for conditional classes
- `tailwind-merge` - Intelligently merges Tailwind CSS classes
- `tw-animate-css` - Animation utilities for Tailwind v4 (replaces tailwindcss-animate)

These utilities are foundational and will be used by shadcn-svelte components.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Install Dependencies

Install the required packages using pnpm:

```bash
pnpm add clsx tailwind-merge
pnpm add -D tw-animate-css
```

### Verify Installation

After installation, verify that the packages are listed in `package.json` and that `pnpm-lock.yaml` has been updated.

## Validate

Run the following command to ensure everything compiles and there are no dependency issues:

```bash
turbo check test
```

This should pass without errors. The packages are now available but not yet used in the codebase.
