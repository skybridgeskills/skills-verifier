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

	it('pulls validFrom, validUntil and achievement description', () => {
		const raw = {
			validFrom: '2024-01-15T00:00:00Z',
			validUntil: '2027-01-15T00:00:00Z',
			credentialSubject: { achievement: { name: 'Welding', description: 'Can weld well.' } }
		};
		const d = extractBadgeDetail(raw);
		expect(d.validFrom).toBe('2024-01-15T00:00:00Z');
		expect(d.validUntil).toBe('2027-01-15T00:00:00Z');
		expect(d.description).toBe('Can weld well.');
	});

	it('omits validUntil and description when absent', () => {
		const d = extractBadgeDetail({ validFrom: '2024-01-15T00:00:00Z' });
		expect(d.validFrom).toBe('2024-01-15T00:00:00Z');
		expect(d.validUntil).toBeUndefined();
		expect(d.description).toBeUndefined();
	});

	it('resolves an achievement image given as a string url', () => {
		const raw = {
			credentialSubject: { achievement: { image: 'https://img.example/badge.png' } }
		};
		expect(extractBadgeDetail(raw).imageUrl).toBe('https://img.example/badge.png');
	});

	it('resolves an achievement image given as an object with an id', () => {
		const raw = {
			credentialSubject: { achievement: { image: { id: 'https://img.example/badge.png' } } }
		};
		expect(extractBadgeDetail(raw).imageUrl).toBe('https://img.example/badge.png');
	});

	it('accepts a data: image url', () => {
		const raw = {
			credentialSubject: { achievement: { image: 'data:image/png;base64,AAAA' } }
		};
		expect(extractBadgeDetail(raw).imageUrl).toBe('data:image/png;base64,AAAA');
	});

	it('falls back to the root image when the achievement has none', () => {
		const raw = {
			credentialSubject: { achievement: { name: 'X' } },
			image: 'https://img.example/root.png'
		};
		expect(extractBadgeDetail(raw).imageUrl).toBe('https://img.example/root.png');
	});

	it('rejects a non-http(s)/data image url', () => {
		const raw = {
			credentialSubject: { achievement: { image: 'did:web:img.example' } },
			image: { id: 'file:///etc/passwd' }
		};
		expect(extractBadgeDetail(raw).imageUrl).toBeUndefined();
	});
});
