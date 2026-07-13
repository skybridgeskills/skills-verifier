import type { VerificationProblem } from '$lib/server/domain/verification/verification-exchange.js';

/** Overall verification outcome surfaced to the applicant. */
export type VerificationOutcome = 'valid' | 'warning' | 'invalid';

/**
 * Derive the overall outcome from all problems (presentation + per-credential):
 * `invalid` if any problem is fatal (critical); else `warning` if any problem
 * exists; else `valid`. Independent of the transaction service's complete/invalid
 * state so non-fatal warnings on a `complete` exchange still surface.
 *
 * Lives outside `$lib/server` (only a type-only import from there) so both the
 * server and Svelte components can reuse it — the `$lib/server` boundary blocks
 * client imports of runtime values.
 */
export function deriveVerificationOutcome(
	problems: readonly VerificationProblem[]
): VerificationOutcome {
	if (problems.some((p) => p.fatal)) return 'invalid';
	if (problems.length > 0) return 'warning';
	return 'valid';
}
