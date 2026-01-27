# Phase 2: Install Tailwind Plugins and Icon System

## Scope of Phase

Install and configure Tailwind plugins and the icon system:

- `@tailwindcss/forms` - Form styling plugin
- `@iconify/tailwind4` - Icon system integration with Tailwind v4
- `@iconify-json/material-symbols-light` - Material Symbols icon set
- `@iconify-json/mdi-light` - Material Design Icons set

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Install Dependencies

Install the Tailwind plugins and icon packages:

```bash
pnpm add -D @tailwindcss/forms @iconify/tailwind4
pnpm add -D @iconify-json/material-symbols-light @iconify-json/mdi-light
```

### Update layout.css

Add the forms plugin and iconify import to `src/routes/layout.css`. The file should currently have:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

Update it to:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@plugin '@tailwindcss/forms';
@plugin '@iconify/tailwind4';
```

### Verify Configuration

The plugins should now be available. The forms plugin will style native HTML form elements, and the iconify plugin will allow using icons via Tailwind classes.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

The dev server should start without errors, and the plugins should be active. You can verify by checking that form elements have improved default styling.
