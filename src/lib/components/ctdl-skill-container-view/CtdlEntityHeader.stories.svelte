<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CtdlEntityHeader from './CtdlEntityHeader.svelte';

	const { Story } = defineMeta({
		title: 'components/CtdlSkillContainerView/CtdlEntityHeader',
		tags: ['autodocs']
	});

	const occupationEntity = {
		'@id': 'https://credentialengineregistry.org/resources/ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		'@type': 'Occupation' as const,
		'ceterms:ctid': 'ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		'ceterms:name': { 'en-US': 'Acute Care Nurses' },
		'ceterms:description': {
			'en-US': 'Provide advanced nursing care for patients with acute conditions.'
		},
		'ceasn:skillEmbodied': [],
		skillCount: 10,
		skillUrls: []
	};
</script>

<Story name="Occupation">
	<CtdlEntityHeader entity={occupationEntity} onBack={() => {}} />
</Story>

<Story name="Framework">
	<CtdlEntityHeader
		entity={{
			'@id': 'https://credentialengineregistry.org/resources/fw-1',
			'@type': 'CompetencyFramework',
			'ceterms:ctid': 'ce-fw-1',
			'ceasn:name': { 'en-US': 'Health IT Framework' },
			'ceasn:description': { 'en-US': 'Competencies for health information roles.' },
			'ceasn:hasTopChild': [],
			skillCount: 0,
			skillUrls: []
		}}
		onBack={() => {}}
	/>
</Story>

<Story name="Job">
	<CtdlEntityHeader
		entity={{
			'@id': 'https://example.org/jobs/demo',
			'@type': 'Job',
			'ceterms:ctid': 'ce-job-demo',
			'ceterms:name': { 'en-US': 'Clinical Nurse II' },
			'ceterms:description': { 'en-US': 'Med-surg unit nursing role.' },
			'ceasn:skillEmbodied': [],
			skillCount: 0,
			skillUrls: []
		}}
		onBack={() => {}}
	/>
</Story>

<Story name="WorkRole">
	<CtdlEntityHeader
		entity={{
			'@id': 'https://example.org/workroles/lead',
			'@type': 'WorkRole',
			'ceterms:ctid': 'ce-wr-lead',
			'ceterms:name': { 'en-US': 'Charge Nurse' },
			'ceterms:description': { 'en-US': 'Supervises shift operations.' },
			'ceasn:skillEmbodied': [],
			skillCount: 0,
			skillUrls: []
		}}
		onBack={() => {}}
	/>
</Story>

<Story name="Task">
	<CtdlEntityHeader
		entity={{
			'@id': 'https://example.org/tasks/triage',
			'@type': 'Task',
			'ceterms:ctid': 'ce-task-triage',
			'ceterms:name': { 'en-US': 'Patient triage' },
			'ceterms:description': { 'en-US': 'Initial assessment and prioritization.' },
			'ceasn:skillEmbodied': [],
			skillCount: 0,
			skillUrls: []
		}}
		onBack={() => {}}
	/>
</Story>
