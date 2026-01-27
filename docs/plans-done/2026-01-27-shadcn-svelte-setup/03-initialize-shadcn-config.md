# Phase 3: Initialize shadcn-svelte Configuration

## Scope of Phase

Run the shadcn-svelte CLI initialization command to create `components.json` configuration file. This will set up the project structure and configuration for adding components.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### Run CLI Initialization

Run the shadcn-svelte initialization command:

```bash
pnpm dlx shadcn-svelte@latest init
```

### Configuration Answers

When prompted, provide the following answers:

1. **Which base color would you like to use?** → `Zinc`
2. **Where is your global CSS file?** → `src/routes/layout.css`
3. **Configure the import alias for lib:** → `$lib`
4. **Configure the import alias for components:** → `$lib/components`
5. **Configure the import alias for utils:** → `$lib/utils`
6. **Configure the import alias for hooks:** → `$lib/hooks`
7. **Configure the import alias for ui:** → `$lib/components/ui`

### Verify components.json

After initialization, verify that `components.json` has been created in the project root with the correct configuration. It should include:

- Base color: `zinc`
- Style: `new-york` (default for Tailwind v4)
- CSS file path: `src/routes/layout.css`
- Component directory: `src/lib/components/ui`
- Utils directory: `src/lib/utils`

### Note on layout.css

The CLI may have modified `src/routes/layout.css`. We'll need to check and potentially restore/merge the Tailwind plugin imports we added in Phase 2. The CLI will have added theme variables, but we need to ensure the plugins are still present.

## Validate

Run the following command to ensure everything compiles:

```bash
turbo check test
```

Check that `components.json` exists and has the correct configuration. Verify that the project still builds successfully.
