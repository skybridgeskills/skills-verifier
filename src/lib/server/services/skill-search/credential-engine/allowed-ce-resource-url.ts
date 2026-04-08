/**
 * Restrict server-side resource fetches to known public registry hosts (SSRF guard).
 */
export function isAllowedCredentialRegistryResourceUrl(urlString: string): boolean {
	try {
		const u = new URL(urlString);
		if (u.protocol !== 'https:') return false;
		const host = u.hostname.toLowerCase();
		return (
			host === 'credentialengineregistry.org' || host.endsWith('.credentialengineregistry.org')
		);
	} catch {
		return false;
	}
}
