import type { VerifiedCredential } from './match-resource.js';

/**
 * Additive merge of verified credentials across exchanges: existing order is
 * preserved; an incoming credential with a matching `credentialId` replaces the
 * existing entry in place (last write wins); new ids are appended in incoming
 * order. Pure — no I/O.
 */
export function mergeCredentialsById(
	existing: VerifiedCredential[],
	incoming: VerifiedCredential[]
): VerifiedCredential[] {
	const incomingById = new Map(incoming.map((c) => [c.credentialId, c]));
	const merged = existing.map((c) => incomingById.get(c.credentialId) ?? c);
	const seen = new Set(existing.map((c) => c.credentialId));
	for (const c of incoming) if (!seen.has(c.credentialId)) merged.push(c);
	return merged;
}
