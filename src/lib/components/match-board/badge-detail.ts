/**
 * Client-safe, best-effort extraction of display details from a stored
 * OpenBadgeCredential `raw` JSON, for the read-only match share view: the
 * achievement name, issuer name, issuer URL, and issuer email (OpenBadges 3.0
 * concepts). All fields are optional — absent/malformed values are simply omitted.
 */

export type BadgeDetail = {
	achievementName?: string;
	issuerName?: string;
	issuerUrl?: string;
	issuerEmail?: string;
	/** Raw ISO issue date (`validFrom`); formatted in the component. */
	validFrom?: string;
	/** Raw ISO expiration date (`validUntil`); only rendered when present. */
	validUntil?: string;
	description?: string;
	/** Only `http(s):` or `data:` image URLs are accepted. */
	imageUrl?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function str(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function isHttpUrl(value: string | undefined): value is string {
	return !!value && /^https?:\/\//i.test(value);
}

/**
 * Resolve an OpenBadges image value — either a bare string URL or a record whose
 * `.id` is the URL (per spec) — to a safe URL. Only `http(s):`/`data:` are accepted;
 * anything else (e.g. `did:`, `file:`) is rejected so no untrusted source is rendered.
 */
function imageUrl(value: unknown): string | undefined {
	const candidate = str(value) ?? str(asRecord(value)?.id);
	return candidate && /^(https?:|data:)/i.test(candidate) ? candidate : undefined;
}

/** Strip a leading `mailto:` and validate a bare email. */
function email(value: unknown): string | undefined {
	const s = str(value);
	if (!s) return undefined;
	const bare = s.replace(/^mailto:/i, '');
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bare) ? bare : undefined;
}

export function extractBadgeDetail(raw: unknown): BadgeDetail {
	const vc = asRecord(raw) ?? {};
	const subject = asRecord(vc.credentialSubject);
	const achievement = asRecord(subject?.achievement);
	const issuer = asRecord(vc.issuer);

	// Issuer URL: prefer an explicit `url`, else the issuer `id` when it is an http(s) URL.
	const issuerUrl = str(issuer?.url) ?? (isHttpUrl(str(issuer?.id)) ? str(issuer?.id) : undefined);

	return {
		achievementName: str(achievement?.name) ?? str(vc.name),
		issuerName: str(issuer?.name),
		issuerUrl,
		issuerEmail: email(issuer?.email),
		validFrom: str(vc.validFrom),
		validUntil: str(vc.validUntil),
		description: str(achievement?.description),
		imageUrl: imageUrl(achievement?.image) ?? imageUrl(vc.image)
	};
}
