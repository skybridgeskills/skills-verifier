# Phase 1: Create Utility Dependencies

## Scope of Phase

Copy and adapt utility functions needed for the async local storage and context system. These utilities will support both Node.js and browser environments.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/util/is-promise-like.ts`

Copy from reference implementation and adapt:

```typescript
/**
 * Type guard to check if a value is a PromiseLike.
 */
export function isPromiseLike<T>(value: any): value is PromiseLike<T> {
	return value && typeof value.then === 'function';
}
```

### 2. Create `src/lib/server/util/panic.ts`

Copy from reference implementation and adapt:

```typescript
/**
 * Throws an error with the given message or error object.
 * Useful for asserting impossible conditions.
 */
export function panic(msgOrErr: string | Error): never {
	throw typeof msgOrErr === 'string' ? new Error(msgOrErr) : msgOrErr;
}

/**
 * Throws an error with multiple lines of text.
 */
export function panicLines(...lines: string[]): never {
	throw new Error(lines.join('\n'));
}
```

### 3. Create `src/lib/server/util/global-singleton.ts`

Copy from reference implementation and adapt. This ensures singletons work across bundled/unbundled code:

```typescript
/**
 * Gets the global object that works in both Node.js and browser environments.
 */
function getGlobalObject(): typeof globalThis {
	return globalThis;
}

/**
 * Creates a global singleton that's shared across all module instances,
 * including bundled code (e.g., from SvelteKit adapter-node).
 */
export async function createGlobalSingleton<T>(key: string, factory: () => Promise<T>): Promise<T> {
	const globalRef = getGlobalObject() as unknown as {
		[key: string]: T | Promise<T> | undefined;
	};

	const instanceKey = key;
	const promiseKey = `${key}Promise`;

	// If we already have an instance (not a Promise), return it
	const existing = globalRef[instanceKey];
	if (existing && !(existing instanceof Promise)) {
		return existing as T;
	}

	// If there's an initialization promise in progress, wait for it
	const existingPromise = globalRef[promiseKey];
	if (existingPromise instanceof Promise) {
		const instance = await existingPromise;
		globalRef[instanceKey] = instance;
		return instance;
	}

	// Create a new instance and store the promise to prevent race conditions
	const promise = factory();
	globalRef[promiseKey] = promise;

	try {
		const instance = await promise;
		globalRef[instanceKey] = instance;
		delete globalRef[promiseKey];
		return instance;
	} catch (error) {
		delete globalRef[promiseKey];
		throw error;
	}
}

/**
 * Gets a global singleton instance synchronously.
 * This should only be called after the singleton has been initialized.
 */
export function getGlobalSingleton<T>(key: string): T {
	const globalRef = getGlobalObject() as unknown as {
		[key: string]: T | undefined;
	};

	const instance = globalRef[key];
	if (!instance) {
		throw new Error(
			`Global singleton "${key}" not initialized. Ensure it's initialized before use.`
		);
	}

	return instance;
}
```

### 4. Create `src/lib/server/util/async-local-storage/fake-async-local-store.ts`

Copy from reference implementation and adapt:

```typescript
import type { AsyncLocalStorage } from 'async_hooks';
import { isPromiseLike } from '../is-promise-like.js';

/**
 * Browser-compatible fake implementation of AsyncLocalStorage.
 * Uses module-level state to simulate async local storage in browser environments.
 */
export function FakeAsyncLocalStore<T>(): Pick<AsyncLocalStorage<T>, 'getStore' | 'run' | 'exit'> {
	let currentStore: T | undefined = undefined;

	return {
		getStore: () => currentStore,
		run: <R>(newStore: T, callback: () => R): R => {
			const oldValue = currentStore;
			currentStore = newStore;

			try {
				const result = callback();

				if (isPromiseLike(result)) {
					return Promise.resolve(result).finally(() => {
						currentStore = oldValue;
					}) as R;
				} else {
					currentStore = oldValue;
					return result;
				}
			} catch (error) {
				currentStore = oldValue;
				throw error;
			}
		},
		exit<R, TArgs extends any[]>(callback: (...args: TArgs) => R, ...args: TArgs): R {
			const prevValue = currentStore;
			currentStore = undefined;
			try {
				const result = callback(...args);

				if (isPromiseLike(result)) {
					return Promise.resolve(result).finally(() => {
						currentStore = prevValue;
					}) as R;
				} else {
					currentStore = prevValue;
					return result;
				}
			} catch (error) {
				currentStore = prevValue;
				throw error;
			}
		}
	};
}
```

### 5. Create `src/lib/server/util/async-local-storage/universal-async-local-store.ts`

Copy from reference implementation and adapt:

```typescript
import { FakeAsyncLocalStore } from './fake-async-local-store.js';

/**
 * Creates an AsyncLocalStorage-compatible store for the current environment,
 * supporting both node and browser environments.
 *
 * On browser, a singleton shim is used.
 */
export async function UniversalAsyncLocalStore<T>(): Promise<{
	getStore(): T | undefined;
	exit<R, TArgs extends any[]>(callback: (...args: TArgs) => R, ...args: TArgs): R;
	run<R>(store: T, callback: () => R): R;
	run<R, TArgs extends any[]>(store: T, callback: (...args: TArgs) => R, ...args: TArgs): R;
}> {
	if (typeof window !== 'undefined') {
		// In browser, use fake
		return FakeAsyncLocalStore<T>();
	}

	// On node, use AsyncLocalStorage
	const { AsyncLocalStorage } = await import('async_hooks');
	return new AsyncLocalStorage();
}
```

## Tests

Create basic tests to verify utilities work:

- `src/lib/server/util/is-promise-like.test.ts` - Test promise detection
- `src/lib/server/util/panic.test.ts` - Test panic functions
- `src/lib/server/util/global-singleton.test.ts` - Test singleton creation and retrieval
- `src/lib/server/util/async-local-storage/fake-async-local-store.test.ts` - Test fake async local storage

## Validate

Run the following command to ensure everything compiles and tests pass:

```bash
turbo check test
```

Verify that:

- All files compile without TypeScript errors
- All tests pass
- No linting errors
- Utilities can be imported and used correctly
