# shadcn-svelte Setup Design

## Scope of Work

Set up shadcn-svelte with basic components and required plugins/utilities according to `architecture.md`:

- Install and configure shadcn-svelte CLI and core dependencies
- Install required utilities: `clsx`, `tailwind-merge`
- Install Tailwind plugins: `@tailwindcss/forms`
- Install icon system: `@iconify/tailwind4` and basic icon sets
- Initialize shadcn-svelte configuration (`components.json`)
- Add basic components to verify setup (Button, Card, Input, Label, Badge)
- Set up dark mode support with toggle mechanism
- Ensure compatibility with existing Tailwind v4 setup

## File Structure

```
.
├── components.json                    # NEW: shadcn-svelte configuration
├── package.json                       # UPDATE: Add dependencies
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                    # NEW: shadcn-svelte components directory
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.svelte
│   │   │   │   │   └── index.ts
│   │   │   │   ├── card/
│   │   │   │   │   ├── card.svelte
│   │   │   │   │   ├── card-content.svelte
│   │   │   │   │   ├── card-description.svelte
│   │   │   │   │   ├── card-footer.svelte
│   │   │   │   │   ├── card-header.svelte
│   │   │   │   │   ├── card-title.svelte
│   │   │   │   │   └── index.ts
│   │   │   │   ├── input/
│   │   │   │   │   ├── input.svelte
│   │   │   │   │   └── index.ts
│   │   │   │   ├── label/
│   │   │   │   │   ├── label.svelte
│   │   │   │   │   └── index.ts
│   │   │   │   └── badge/
│   │   │   │       ├── badge.svelte
│   │   │   │       └── index.ts
│   │   │   └── theme-toggle/          # NEW: Dark mode toggle component
│   │   │       ├── ThemeToggle.svelte
│   │   │       └── index.ts
│   │   └── utils.ts                   # NEW: Utility functions (cn helper)
│   └── routes/
│       ├── +layout.svelte              # UPDATE: Add dark mode class management
│       └── layout.css                  # UPDATE: Add theme variables, dark mode styles
```

## Conceptual Architecture

### Component Organization

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                      │
│  (Existing components: Card, JobProfileForm, etc.)       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│              shadcn-svelte Components                     │
│  (Button, Card, Input, Label, Badge, etc.)               │
│  Located in: src/lib/components/ui/                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Utility Layer                          │
│  - cn() function (clsx + tailwind-merge)                │
│  - Theme utilities                                       │
│  Located in: src/lib/utils.ts                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Styling Layer                         │
│  - Tailwind CSS v4 (@tailwindcss/vite)                  │
│  - @tailwindcss/typography plugin                       │
│  - @tailwindcss/forms plugin                            │
│  - @iconify/tailwind4                                   │
│  - Theme CSS variables (light/dark)                     │
│  Located in: src/routes/layout.css                       │
└─────────────────────────────────────────────────────────┘
```

### Dark Mode Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Theme Toggle Component                       │
│  - Reads/writes to localStorage                         │
│  - Toggles 'dark' class on <html> element               │
└─────────────────────────────────────────────────────────┘
                          │
                          │ manages
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Theme State Management                      │
│  - localStorage: 'theme' key                             │
│  - System preference detection                          │
│  - HTML class: 'dark' for dark mode                     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ controls
                          ▼
┌─────────────────────────────────────────────────────────┐
│              CSS Theme Variables                         │
│  - :root (light mode variables)                         │
│  - .dark (dark mode variables)                          │
│  - @theme inline (Tailwind v4 theme config)             │
└─────────────────────────────────────────────────────────┘
```

## Main Components and Interactions

### 1. shadcn-svelte Components (`src/lib/components/ui/`)

- **Button**: Primary action component with variants (default, destructive, outline, secondary, ghost, link)
- **Card**: Container component with header, content, footer, title, description sub-components
- **Input**: Form input field component
- **Label**: Form label component
- **Badge**: Small status/indicator component

### 2. Utility Functions (`src/lib/utils.ts`)

- **cn()**: Combines `clsx` and `tailwind-merge` to merge class names intelligently
- Handles Tailwind class conflicts and conditional classes

### 3. Theme System (`src/routes/layout.css`)

- **CSS Variables**: Theme colors defined as CSS custom properties
- **Light Mode**: Default `:root` variables
- **Dark Mode**: `.dark` class variables
- **Tailwind Integration**: `@theme inline` directive for Tailwind v4
- **Plugins**: Typography and Forms plugins configured

### 4. Dark Mode Toggle (`src/lib/components/theme-toggle/`)

- **ThemeToggle Component**: Button/switch to toggle between light/dark modes
- **State Management**: Uses localStorage to persist preference
- **System Preference**: Detects and respects system theme preference
- **HTML Class Management**: Adds/removes `dark` class on `<html>` element

### 5. Configuration (`components.json`)

- **Base Color**: Zinc
- **Style**: new-york (default for Tailwind v4)
- **Component Paths**: Configured for SvelteKit structure
- **CSS File**: Points to `src/routes/layout.css`

## Integration Points

1. **Existing Components**: Can continue using custom components alongside shadcn-svelte components
2. **Form Elements**: Native HTML form elements will benefit from `@tailwindcss/forms` styling
3. **Icons**: Iconify integration allows using icons via Tailwind classes
4. **Dark Mode**: All components automatically support dark mode via CSS variables
5. **TypeScript**: Full type safety for all components and utilities

## Dependencies

### New Dependencies

- `shadcn-svelte` (via CLI)
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind class merging
- `@tailwindcss/forms` - Form styling plugin
- `@iconify/tailwind4` - Icon system integration
- `@iconify-json/material-symbols-light` - Material Symbols icon set
- `@iconify-json/mdi-light` - Material Design Icons set
- `tw-animate-css` - Animation utilities for Tailwind v4
- Component dependencies (bits-ui, tailwind-variants, etc.) - Installed automatically by CLI

### Updated Files

- `package.json` - New dependencies
- `src/routes/layout.css` - Theme variables and plugin configuration
- `src/routes/+layout.svelte` - Dark mode initialization
