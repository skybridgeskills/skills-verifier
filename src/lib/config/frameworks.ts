import type { Framework } from '$lib/types/job-profile';

/**
 * Predefined list of competency frameworks from Credential Engine Registry.
 * These frameworks are available for selection when creating job profiles.
 */
export const FRAMEWORKS: Framework[] = [
	{
		name: 'Health Information Management',
		organization: 'Dyersburg State Community College',
		url: 'https://credentialengineregistry.org/resources/ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd',
		ctid: 'ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd',
	},
	{
		name: 'Business, Management',
		organization: 'Chattanooga State Community College',
		url: 'https://credentialengineregistry.org/resources/ce-07220a5c-0f8a-4c5f-a458-acaebeea13f9',
		ctid: 'ce-07220a5c-0f8a-4c5f-a458-acaebeea13f9',
	},
];
