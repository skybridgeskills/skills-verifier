import { describe, expect, it } from 'vitest';

import type { VerifiedCredential } from './match-resource.js';
import { mergeCredentialsById } from './merge-credentials.js';

function cred(id: string, extra: Partial<VerifiedCredential> = {}): VerifiedCredential {
	return { credentialId: id, raw: {}, verified: true, problems: [], ...extra };
}

describe('mergeCredentialsById', () => {
	it('returns incoming when existing is empty', () => {
		const incoming = [cred('a'), cred('b')];
		expect(mergeCredentialsById([], incoming)).toEqual(incoming);
	});

	it('concatenates disjoint ids in existing-then-incoming order', () => {
		const merged = mergeCredentialsById([cred('a'), cred('b')], [cred('c'), cred('d')]);
		expect(merged.map((c) => c.credentialId)).toEqual(['a', 'b', 'c', 'd']);
	});

	it('replaces an overlapping id in place with the incoming record (last write wins)', () => {
		const existing = [cred('a', { name: 'old A' }), cred('b')];
		const incoming = [cred('a', { name: 'new A' })];
		const merged = mergeCredentialsById(existing, incoming);
		expect(merged.map((c) => c.credentialId)).toEqual(['a', 'b']);
		expect(merged[0].name).toBe('new A');
	});

	it('replaces overlaps in place and appends genuinely new ids', () => {
		const existing = [cred('a', { name: 'old A' }), cred('b')];
		const incoming = [cred('a', { name: 'new A' }), cred('c')];
		const merged = mergeCredentialsById(existing, incoming);
		expect(merged.map((c) => c.credentialId)).toEqual(['a', 'b', 'c']);
		expect(merged[0].name).toBe('new A');
	});

	it('leaves existing unchanged when incoming is empty', () => {
		const existing = [cred('a'), cred('b')];
		expect(mergeCredentialsById(existing, [])).toEqual(existing);
	});
});
