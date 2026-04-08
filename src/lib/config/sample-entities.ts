import type { QuickPickItem, Skill } from '$lib/types/job-profile';

/**
 * Sample skills for quick pick selection.
 */
const SAMPLE_QUICK_PICK_SKILLS: Skill[] = [
	{
		url: 'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
		label: 'Health information systems',
		text: 'Understand and use health information systems effectively.',
		ctid: 'ce-777ff155-e07f-4843-9274-6a78783f6641'
	},
	{
		url: 'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
		label: 'Health care organizations',
		text: 'Describe health care organizations from the perspective of key stakeholders.',
		ctid: 'ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f'
	},
	{
		url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
		label: 'Critical Thinking',
		ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
	},
	{
		url: 'https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac',
		label: 'Active Listening',
		ctid: 'ce-07c2613a-9119-11e8-b852-782bcb5df6ac'
	}
];

/**
 * Sample occupations from CTDL data.
 * These include skillEmbodied, knowledgeEmbodied, and abilityEmbodied arrays.
 */
export const SAMPLE_OCCUPATIONS: QuickPickItem[] = [
	{
		type: 'Occupation',
		entity: {
			'@id':
				'https://credentialengineregistry.org/resources/ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
			name: 'Acute Care Nurses',
			description:
				'Provide advanced nursing care for patients with acute conditions such as heart attacks, respiratory distress syndrome, or shock. May care for pre- and post-operative patients or perform advanced, invasive diagnostic or therapeutic procedures.',
			skillCount: 30
		},
		skills: [
			// Sample subset of skills for quick add
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
				label: 'Critical Thinking',
				ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
			},
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac',
				label: 'Active Listening',
				ctid: 'ce-07c2613a-9119-11e8-b852-782bcb5df6ac'
			},
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c26361-9119-11e8-b852-782bcb5df6ac',
				label: 'Social Perceptiveness',
				ctid: 'ce-07c26361-9119-11e8-b852-782bcb5df6ac'
			}
		]
	},
	{
		type: 'Occupation',
		entity: {
			'@id':
				'https://credentialengineregistry.org/resources/ce-e6cdee82-b2b0-4dfd-89c6-af28667065a2',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-e6cdee82-b2b0-4dfd-89c6-af28667065a2',
			name: 'Clinical Nurse Specialists',
			description:
				'Direct nursing staff in the provision of patient care in a clinical practice setting, such as a hospital, hospice, clinic, or home. Ensure adherence to established clinical policies, protocols, regulations, and standards.',
			skillCount: 25
		},
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
				label: 'Critical Thinking',
				ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
			},
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c2658f-9119-11e8-b852-782bcb5df6ac',
				label: 'Service Orientation',
				ctid: 'ce-07c2658f-9119-11e8-b852-782bcb5df6ac'
			}
		]
	},
	{
		type: 'Occupation',
		entity: {
			'@id':
				'https://credentialengineregistry.org/resources/ce-be0cebf1-8229-4263-893e-88fed6f534d2',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-be0cebf1-8229-4263-893e-88fed6f534d2',
			name: 'Critical Care Nurses',
			description:
				'Provide specialized nursing care for patients in critical or coronary care units.',
			skillCount: 28
		},
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c26479-9119-11e8-b852-782bcb5df6ac',
				label: 'Complex Problem Solving',
				ctid: 'ce-07c26479-9119-11e8-b852-782bcb5df6ac'
			},
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c26751-9119-11e8-b852-782bcb5df6ac',
				label: 'Judgment and Decision Making',
				ctid: 'ce-07c26751-9119-11e8-b852-782bcb5df6ac'
			}
		]
	},
	{
		type: 'Occupation',
		entity: {
			'@id':
				'https://credentialengineregistry.org/resources/ce-5f43c6e3-251b-42f2-a130-36d1c92968b6',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-5f43c6e3-251b-42f2-a130-36d1c92968b6',
			name: 'Endoscopy Technicians',
			description:
				'Maintain a sterile field to provide support for physicians and nurses during endoscopy procedures. Prepare and maintain instruments and equipment. May obtain specimens.',
			skillCount: 22
		},
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c25988-9119-11e8-b852-782bcb5df6ac',
				label: 'Monitoring',
				ctid: 'ce-07c25988-9119-11e8-b852-782bcb5df6ac'
			}
		]
	}
];

/**
 * Sample jobs for quick pick selection.
 * Jobs are employer-specific instances of occupations.
 */
export const SAMPLE_JOBS: QuickPickItem[] = [
	{
		type: 'Job',
		entity: {
			'@id': 'https://example.org/jobs/senior-nurse-nexus-health',
			'@type': 'Job',
			'ceterms:ctid': 'ce-job-senior-nurse-001',
			name: 'Senior Acute Care Nurse - Nexus Health',
			description:
				'Senior nursing position at Nexus Health Systems with advanced patient care responsibilities.',
			skillCount: 35
		},
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
				label: 'Critical Thinking',
				ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
			},
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c26809-9119-11e8-b852-782bcb5df6ac',
				label: 'Coordination',
				ctid: 'ce-07c26809-9119-11e8-b852-782bcb5df6ac'
			}
		]
	}
];

/**
 * Combined quick picks array with all entity types.
 * Used by the QuickPicks component.
 */
export const QUICK_PICKS: QuickPickItem[] = [
	// Skills first
	...SAMPLE_QUICK_PICK_SKILLS.map((skill) => ({ type: 'Skill' as const, entity: skill })),
	// Then occupations and jobs
	...SAMPLE_OCCUPATIONS,
	...SAMPLE_JOBS
];
