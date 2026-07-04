import { describe, expect, it } from 'vitest';

import { extractBadgeDetail } from './badge-detail.js';

describe('extractBadgeDetail', () => {
	it('pulls achievement name, issuer name/url/email from an OB 3.0 credential', () => {
		const raw = {
			credentialSubject: { achievement: { name: 'Welding Level 2' } },
			issuer: {
				id: 'did:web:issuer.example',
				name: 'Riverside Community College',
				url: 'https://riverside.example',
				email: 'mailto:badges@riverside.example'
			}
		};
		expect(extractBadgeDetail(raw)).toEqual({
			achievementName: 'Welding Level 2',
			issuerName: 'Riverside Community College',
			issuerUrl: 'https://riverside.example',
			issuerEmail: 'badges@riverside.example'
		});
	});

	it('falls back to the top-level credential name and the issuer id when it is an http url', () => {
		const raw = {
			name: 'Digital Literacy',
			issuer: { name: 'Acme', id: 'https://acme.example/issuer' }
		};
		const d = extractBadgeDetail(raw);
		expect(d.achievementName).toBe('Digital Literacy');
		expect(d.issuerUrl).toBe('https://acme.example/issuer');
		expect(d.issuerEmail).toBeUndefined();
	});

	it('omits a non-http issuer id and an invalid email', () => {
		const raw = { issuer: { name: 'Acme', id: 'did:key:z123', email: 'not-an-email' } };
		const d = extractBadgeDetail(raw);
		expect(d.issuerUrl).toBeUndefined();
		expect(d.issuerEmail).toBeUndefined();
	});

	it('returns an empty object for malformed input', () => {
		expect(extractBadgeDetail(null)).toEqual({});
		expect(extractBadgeDetail('nope')).toEqual({});
		expect(extractBadgeDetail({})).toEqual({});
	});
});
