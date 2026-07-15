/**
 * Returns `next` only when it is a safe local redirect target, else `'/'`.
 *
 * A safe target starts with a single `/` and is not protocol-relative. Blocks
 * `//evil.com`, `/\evil.com` (browsers normalize the backslash to `/`), and
 * absolute URLs like `https://evil.com`.
 */
export function safeNext(next: string | null | undefined): string {
	if (!next || next[0] !== '/') return '/';
	if (next[1] === '/' || next[1] === '\\') return '/';
	return next;
}
