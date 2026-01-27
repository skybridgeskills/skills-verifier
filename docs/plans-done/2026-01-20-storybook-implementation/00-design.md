# Design Overview: Storybook Implementation for skills-verifier

## File Structure

```
skills-verifier/
├── .storybook/                          # NEW: Storybook configuration directory
│   ├── main.ts                          # NEW: Storybook main config (stories paths, addons, framework)
│   └── preview.ts                       # NEW: Storybook preview config (decorators, parameters)
├── package.json                         # UPDATE: Add Storybook dependencies and scripts
├── src/
│   ├── lib/
│   │   └── components/                  # NEW: Component directory
│   │       ├── Card.svelte              # NEW: Example Card component
│   │       └── Card.stories.svelte      # NEW: Example Card story file
│   └── routes/
│       └── +page.stories.svelte         # NEW: Example route story (optional, for testing)
└── vite.config.ts                       # UPDATE: May need minor adjustments for Storybook compatibility
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Storybook UI                          │
│  (Storybook Framework - @storybook/sveltekit)           │
└─────────────────────────────────────────────────────────┘
                          │
                          │ loads
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Storybook Configuration                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ .storybook/main.ts                               │  │
│  │  - Stories paths:                                │  │
│  │    * src/routes/**/*.stories.svelte              │  │
│  │    * src/lib/components/**/*.stories.svelte      │  │
│  │  - Addons:                                        │  │
│  │    * @storybook/addon-svelte-csf                 │  │
│  │    * @storybook/addon-a11y                       │  │
│  │    * @storybook/addon-docs                       │  │
│  │    * @storybook/addon-interactions              │  │
│  │  - Framework: @storybook/sveltekit              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ .storybook/preview.ts                           │  │
│  │  - Global decorators                            │  │
│  │  - Parameters (controls, a11y)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ indexes & renders
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Story Files                           │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │ Card.stories.svelte  │  │ +page.stories.svelte     │ │
│  │  - Default story     │  │  - Route page story      │ │
│  │  - Variants          │  │  - With play function   │ │
│  │  - With play fn      │  │                         │ │
│  └──────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ imports
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Svelte Components                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Card.svelte                                      │  │
│  │  - Presentational component                      │  │
│  │  - Tailwind styling                             │  │
│  │  - Responsive design                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Simplified Configuration**: No custom indexer needed; use Storybook's default indexing with configured story paths.
2. **Standard Addons**: Use out-of-the-box addons for interactions (`@storybook/addon-interactions`) without complex backend mocking.
3. **Component Location**: Components stored in `src/lib/components/` following SvelteKit conventions.
4. **Story Discovery**: Stories automatically discovered from:
   - `src/routes/**/*.stories.svelte`
   - `src/lib/components/**/*.stories.svelte`
5. **Vite Integration**: Storybook uses SvelteKit's Vite config; minimal changes needed.

## Dependencies to Add

- `storybook@10.0.2`
- `@storybook/sveltekit@10.0.2`
- `@storybook/addon-svelte-csf@^5.0.10`
- `@storybook/addon-a11y@^10.0.2`
- `@storybook/addon-docs@^10.0.2`
- `@storybook/addon-interactions@^10.0.2`
- `@storybook/test@^10.0.2` (for play functions)

## Scripts to Add

- `storybook` - Run Storybook development server
- `build-storybook` - Build static Storybook for deployment
- `test:storybook` - Run Storybook interaction tests (optional)
