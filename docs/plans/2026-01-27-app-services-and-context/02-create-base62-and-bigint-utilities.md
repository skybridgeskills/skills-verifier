# Phase 2: Create Base62 and BigInt Utilities

## Scope of Phase

Copy and adapt base62 encoding and bigint conversion utilities from the reference implementation. These utilities are needed for the ID service to generate base-62 encoded IDs.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/util/number/bytes-to-big-int.ts`

Copy from reference implementation. This converts a Uint8Array of bytes to a BigInt:

```typescript
/**
 * Converts a Uint8Array of bytes to a BigInt.
 * Treats bytes as a big-endian number in base 256.
 */
export function bytesToBigInt(bytes: Uint8Array): bigint {
	let result = 0n;
	for (let i = 0; i < bytes.length; i++) {
		result = result * 256n + BigInt(bytes[i]);
	}
	return result;
}
```

### 2. Create `src/lib/server/util/number/to-base62.ts`

Copy from reference implementation. This converts a BigInt to a base-62 string:

```typescript
/**
 * Base-62 alphabet (0-9, A-Z, a-z)
 */
const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Converts a BigInt to a base-62 string representation.
 * Pads with zeros to ensure the result has at least the specified length.
 *
 * @param num - The BigInt to convert
 * @param minLength - Minimum length of the output string (padded with zeros if needed)
 * @returns Base-62 encoded string
 */
export function toBase62(num: bigint, minLength: number): string {
	if (num === 0n) {
		return '0'.repeat(minLength);
	}

	let result = '';
	let remaining = num;

	while (remaining > 0n) {
		const remainder = Number(remaining % 62n);
		result = BASE62_ALPHABET[remainder] + result;
		remaining = remaining / 62n;
	}

	// Pad with zeros if needed
	while (result.length < minLength) {
		result = '0' + result;
	}

	return result;
}
```

## Tests

Create tests to verify utilities work correctly:

- `src/lib/server/util/number/bytes-to-big-int.test.ts` - Test byte array to BigInt conversion
- `src/lib/server/util/number/to-base62.test.ts` - Test BigInt to base62 conversion

Test cases should include:

- Zero values
- Single byte values
- Multi-byte values
- Edge cases (maximum values, minimum values)
- Padding behavior

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
- Base62 encoding produces expected output for known inputs
