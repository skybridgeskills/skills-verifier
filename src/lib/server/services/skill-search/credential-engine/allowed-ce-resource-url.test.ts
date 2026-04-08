import { describe, expect, it } from 'vitest';

import { isAllowedCredentialRegistryResourceUrl } from './allowed-ce-resource-url.js';

describe('isAllowedCredentialRegistryResourceUrl', () => {
	it('allows production registry HTTPS URLs', () => {
		expect(
			isAllowedCredentialRegistryResourceUrl(
				'https://credentialengineregistry.org/resources/ce-123'
			)
		).toBe(true);
	});

	it('rejects non-registry hosts', () => {
		expect(isAllowedCredentialRegistryResourceUrl('https://evil.example/ssrf')).toBe(false);
	});

	it('rejects non-HTTPS', () => {
		expect(
			isAllowedCredentialRegistryResourceUrl('http://credentialengineregistry.org/resources/x')
		).toBe(false);
	});
});
