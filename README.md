# LER Skills Verifier

An open-source demonstration tool for skills-first hiring and advancement practices. The LER Skills Verifier helps employers verify, trust, and match Learning and Employment Records (LERs) to job requirements, addressing a critical gap in the LER ecosystem.

## Overview

The LER Skills Verifier is a web application that enables employers to:

- **Verify credentials** - Authenticate and validate LERs from various issuers
- **Match skills** - Connect skills recognized by education to those referenced in position descriptions
- **Evaluate trustworthiness** - Assess the authenticity and credibility of credentials from previously-unknown organizations
- **Process at scale** - Sort through large numbers of LERs and match them to job requirements
- **Demonstrate value** - Provide a tangible example of how LERs can be consumed and used by employers

The tool addresses key gaps in the LER ecosystem by providing an open-source, employer-facing solution that makes LERs approachable and immediately usable. It integrates with existing T3 Network innovations like LinkedClaims, Trusted Career Profile (LER-RS), Resume Author, and JobSIDE.

### Design Goals

- Make LERs more approachable for skills-based hiring and advancement
- Provide an always-available demonstration tool
- Add simple skills documentation to existing job application processes
- Support applicants with or without prior LERs
- Enable adoption by ATS/HRIS vendors through working examples and source code

## Development

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm (version 10.22.0 or compatible)

### Setup

1. **Clone the repository**

   ```sh
   git clone <repository-url>
   cd skills-verifier
   ```

2. **Install dependencies**

   ```sh
   pnpm install
   ```

3. **Set up Git hooks**

   Git hooks are automatically configured via the `prepare` script. Husky will set up pre-commit hooks that run formatting checks.

4. **Start the development server**

   ```sh
   turbo dev
   ```

   The app will be available at `http://localhost:5173` (or the port shown in the terminal).

   To run Storybook separately:

   ```sh
   turbo storybook
   ```

   Storybook will be available at `http://localhost:6006`

### Development Tools

#### Type Checking (Watch Mode)

Run type checking in watch mode for faster feedback:

```sh
pnpm run check:watch
```

## Turbo Commands

This project uses [Turborepo](https://turbo.build/) for task orchestration and caching. All commands should be run through Turbo for optimal performance.

### Category Tasks

These are high-level tasks that orchestrate multiple tool-specific tasks:

#### Build

Build the application for production:

```sh
pnpm turbo build
```

This runs:

- `build:svelte` - Builds the SvelteKit application

#### Check

Run all code quality checks:

```sh
pnpm turbo check
```

This runs:

- `check:prettier` - Checks code formatting
- `check:eslint` - Lints code for errors
- `check:typescript` - Type checks TypeScript
- `check:svelte` - Validates Svelte components

#### Fix

Auto-fix formatting and linting issues:

```sh
pnpm turbo fix
```

This runs:

- `fix:prettier` - Formats code with Prettier
- `fix:eslint` - Fixes ESLint issues automatically

#### Test

Run unit tests:

```sh
pnpm turbo test
```

This runs:

- `test:vitest` - Executes Vitest unit tests

#### E2E

Run end-to-end tests:

```sh
pnpm turbo e2e
```

This runs:

- `e2e:playwright` - Executes Playwright E2E tests (depends on `build`)

### Development Tasks

#### Dev

Start the development server:

```sh
pnpm turbo dev
```

#### Preview

Preview the production build locally:

```sh
pnpm turbo preview
```

#### Storybook

Start Storybook development server:

```sh
pnpm turbo storybook
```

Build Storybook for production:

```sh
pnpm turbo build:storybook
```

### Git Hooks

#### Pre-commit

The pre-commit hook automatically runs before each commit:

```sh
pnpm turbo pre-commit
```

This runs:

- `fix-staged-fast` - Formats only staged files with Prettier (fast, non-blocking)

The hook is configured via Husky and runs automatically on `git commit`. You can also run it manually using the command above.

### Tool-Specific Tasks

You can also run individual tool-specific tasks directly:

```sh
# Build tasks
pnpm run build:svelte
pnpm run build:storybook

# Check tasks
pnpm run check:prettier
pnpm run check:eslint
pnpm run check:typescript
pnpm run check:svelte

# Fix tasks
pnpm run fix:prettier
pnpm run fix:eslint

# Test tasks
pnpm run test:vitest
pnpm run e2e:playwright
```

## Project Structure

```
skills-verifier/
├── src/                    # Source code
│   ├── lib/               # Library code (components, services, types)
│   ├── routes/            # SvelteKit routes
│   └── app.d.ts           # Type definitions
├── e2e/                   # End-to-end tests
├── .storybook/            # Storybook configuration
├── static/                # Static assets
├── turbo.jsonc            # Turborepo configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)
- **Component Development**: Storybook
- **Task Runner**: Turborepo
- **Code Quality**: ESLint, Prettier, svelte-check
- **Git Hooks**: Husky, lint-staged

## Contributing

1. Make your changes
2. Run checks: `pnpm turbo check`
3. Fix any issues: `pnpm turbo fix`
4. Run tests: `pnpm turbo test`
5. Commit (pre-commit hook will format staged files automatically)

## License

[Add license information]
