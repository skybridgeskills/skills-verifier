# Turbo Setup Design

## Scope of Work

Set up Turborepo (Turbo) for the skills-verifier project with category tasks:

- `build` - Build the application (depends on `build:svelte`)
- `fix` - Auto-fix linting and formatting issues (depends on `fix:prettier`, `fix:eslint`)
- `check` - Run all checks (depends on `check:prettier`, `check:eslint`, `check:typescript`, `check:svelte`)
- `test` - Run unit tests (depends on `test:vitest`)
- `e2e` - Run end-to-end tests (depends on `e2e:playwright`)

Additional tasks:

- `dev` - Development server (cache: false, persistent: true)
- `preview` - Preview built application (cache: false)
- `dev:storybook` - Storybook development server (cache: false, persistent: true)
- `build:storybook` - Build Storybook

## File Structure

```
.
├── turbo.jsonc                    # NEW: Turbo configuration
└── package.json                   # UPDATE: Rename/restructure scripts
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    turbo.jsonc                          │
│  Category Tasks (orchestration layer)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │  build  │  │  check  │  │   fix   │  │  test   │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │
│       │            │            │            │        │
│       │            │            │            │        │
│       ▼            ▼            ▼            ▼        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │build:    │ │check:    │ │fix:      │ │test:     ││
│  │svelte    │ │prettier  │ │prettier  │ │vitest    ││
│  │          │ │eslint    │ │eslint    │ │          ││
│  │          │ │typescript│ │          │ │          ││
│  │          │ │svelte    │ │          │ │          ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────────┘
                        │
                        │ depends on
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    package.json                         │
│  Tool-specific scripts (implementation layer)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │build:svelte  │  │check:prettier│  │fix:prettier  ││
│  │check:eslint  │  │check:typescript│ │fix:eslint   ││
│  │test:vitest   │  │e2e:playwright │  │...           ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Main Components and Interactions

### Turbo Configuration (`turbo.jsonc`)

- **Category tasks**: High-level orchestration tasks (`build`, `check`, `fix`, `test`, `e2e`)
  - These tasks depend on tool-specific tasks
  - They are NOT defined in package.json
- **Tool-specific task definitions**: Configuration for tasks like `test:vitest`, `check:eslint`
  - These reference scripts that ARE defined in package.json
  - Include caching configuration, inputs, outputs, environment variables
- **Global environment variables**: `CI`, `NODE_ENV`

### Package.json Scripts

- **Tool-specific scripts**: Actual command implementations
  - `build:svelte` - vite build
  - `check:prettier` - prettier --check
  - `check:eslint` - eslint .
  - `check:typescript` - svelte-check (TypeScript checking)
  - `check:svelte` - svelte-check (Svelte checking)
  - `fix:prettier` - prettier --write
  - `fix:eslint` - eslint --fix
  - `test:vitest` - vitest
  - `e2e:playwright` - playwright test
  - `dev` - vite dev
  - `preview` - vite preview
  - `dev:storybook` - storybook dev
  - `build:storybook` - storybook build

### Task Execution Flow

1. User runs `turbo test`
2. Turbo looks up `test` task in `turbo.jsonc`
3. Turbo sees `test` depends on `test:vitest`
4. Turbo looks for `test:vitest` script in `package.json`
5. Turbo executes `test:vitest` script (which runs `vitest`)
6. Turbo caches the result based on configured inputs/outputs

### Caching Strategy

- **Cached tasks**: Most build, check, fix, and test tasks
  - Inputs: source files, config files
  - Outputs: build artifacts, test results
- **Non-cached tasks**: Development servers (`dev`, `dev:storybook`, `preview`)
  - These are long-running processes that shouldn't be cached
- **Persistent tasks**: Development servers that run indefinitely (`dev`, `dev:storybook`)
