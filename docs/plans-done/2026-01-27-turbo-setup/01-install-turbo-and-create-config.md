# Phase 1: Install Turbo and Create turbo.jsonc Structure

## Scope of Phase

Install Turborepo as a dev dependency and create the initial `turbo.jsonc` file with the basic structure, schema, global environment variables, and UI configuration.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

1. **Install Turbo**:

   ```bash
   pnpm add -D turbo
   ```

2. **Create `turbo.jsonc`** with basic structure:
   - Add `$schema` pointing to Turbo schema
   - Set `ui` to `"tui"` (terminal UI)
   - Add `globalEnv` array with `["CI", "NODE_ENV"]`
   - Create empty `tasks` object (will be populated in later phases)

   Example structure:

   ```jsonc
   {
   	"$schema": "https://turborepo.com/schema.json",
   	"ui": "tui",
   	"globalEnv": ["CI", "NODE_ENV"],
   	"tasks": {
   		// Will be populated in next phases
   	}
   }
   ```

## Validate

Run the following commands to validate:

```bash
# Verify turbo is installed
pnpm turbo --version

# Verify turbo.jsonc is valid (should not error)
pnpm turbo run build --dry-run
```

The `--dry-run` flag will validate the config without actually running tasks. It may show warnings about missing tasks, which is expected at this stage.
