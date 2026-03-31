/**
 * Service for generating IDs and test strings.
 */
export interface IdService {
	/**
	 * Generates a string for testing with the given prefix.
	 * Useful for mock data. In tests, "name" would give "name-1", "name-2", etc.
	 * In production, this shouldn't be used often, but would likely give a time-based string.
	 */
	testStr(prefix: string): string;

	/**
	 * Generates a base-62 ID with 128 bits of entropy for cases where unguessability is needed.
	 * In tests, this uses testStr with "secure1", "secure2", etc.
	 */
	secureUid(): string;

	/**
	 * Generates a base-62 ID with 64 bits of entropy for unique but not unguessable use cases.
	 * In tests, this uses testStr with "unique1", "unique2", etc.
	 */
	uniqueUid(): string;
}

/** Context slice installed by {@link RealIdServiceCtx} / {@link FakeIdServiceCtx}. */
export type IdServiceCtx = {
	idService: IdService;
};
