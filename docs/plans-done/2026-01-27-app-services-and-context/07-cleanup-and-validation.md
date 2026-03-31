# Phase 7: Cleanup and Validation

## Scope of Phase

Final cleanup, validation, and verification that everything works correctly. Remove any temporary code, fix warnings, and ensure all tests pass.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Search for Temporary Code

Use grep to find any temporary code, TODOs, or debug statements:

```bash
grep -r "TODO\|FIXME\|XXX\|HACK\|DEBUG" src/lib/server/
```

Remove or address any temporary code found.

### 2. Check for Unused Imports

Run the linter to check for unused imports and remove them:

```bash
turbo check:eslint
```

Fix any unused import warnings.

### 3. Verify All Tests Pass

Run the full test suite:

```bash
turbo check test
```

Ensure all tests pass and there are no test failures.

### 4. Verify TypeScript Compilation

Ensure everything compiles without errors:

```bash
turbo check:typescript
```

Fix any TypeScript errors.

### 5. Verify Code Formatting

Ensure code is properly formatted:

```bash
turbo check:prettier
```

Fix any formatting issues if needed.

### 6. Integration Test

Create a simple integration test to verify the entire system works together:

Create `src/lib/server/app-context.integration.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { runInContext, appContext } from './app-context.js';
import { FakeAppContext } from './fake-app-context.js';
import { RealAppContext } from './real-app-context.js';

describe('App Context Integration', () => {
	it('works with FakeAppContext', () => {
		const context = FakeAppContext();

		runInContext(context, () => {
			const ctx = appContext();

			// Test time service
			const time1 = ctx.timeService.dateNowMs();
			const time2 = ctx.timeService.dateNowMs();
			expect(time2).toBeGreaterThan(time1);

			// Test ID service
			const id1 = ctx.idService.secureUid();
			const id2 = ctx.idService.secureUid();
			expect(id1).not.toBe(id2);

			// Test framework client exists
			expect(ctx.frameworkClient).toBeDefined();
		});
	});

	it('works with RealAppContext', () => {
		const context = RealAppContext();

		runInContext(context, () => {
			const ctx = appContext();

			// Test time service
			const time = ctx.timeService.dateNowMs();
			expect(time).toBeGreaterThan(0);

			// Test ID service
			const id = ctx.idService.secureUid();
			expect(id.length).toBeGreaterThan(0);

			// Test framework client exists
			expect(ctx.frameworkClient).toBeDefined();
		});
	});
});
```

## Validate

Run the following command to ensure everything is clean and working:

```bash
turbo check test
```

Verify that:

- All tests pass (including integration test)
- No TypeScript errors
- No linting errors
- No formatting issues
- No temporary code or TODOs remain
- All imports are used
- The system works end-to-end
