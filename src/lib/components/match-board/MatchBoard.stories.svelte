<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { Skill } from '$lib/types/job-profile';

	import MatchBoard from './MatchBoard.svelte';
	import type { ClientAssignment, ClientCredential } from './types.js';

	const skills: Skill[] = [
		{
			url: 'https://example.com/skill1',
			label: 'Kubernetes orchestration',
			text: 'Design and operate multi-cluster container platforms.',
			ctid: 'ce-skill-1'
		},
		{
			url: 'https://example.com/skill2',
			label: 'Incident response',
			text: 'Lead production incident triage and remediation.',
			ctid: 'ce-skill-2'
		},
		{
			url: 'https://example.com/skill3',
			label: 'Infrastructure as code',
			text: 'Author and review Terraform / Pulumi modules.',
			ctid: 'ce-skill-3'
		}
	];

	const credentials: ClientCredential[] = [
		{ credentialId: 'cred-cka', name: 'Certified Kubernetes Administrator', issuer: 'CNCF' },
		{ credentialId: 'cred-sre', name: 'SRE Professional', issuer: 'DevOps Institute' },
		{ credentialId: 'cred-tf', name: 'Terraform Associate', issuer: 'HashiCorp' }
	];

	const preAssigned: ClientAssignment[] = [
		{
			skillCtid: 'ce-skill-1',
			skillUrl: 'https://example.com/skill1',
			credentialId: 'cred-cka',
			narrative: 'The CKA exam directly covers cluster administration and orchestration.'
		},
		{
			skillCtid: 'ce-skill-2',
			skillUrl: 'https://example.com/skill2',
			credentialId: 'cred-sre',
			narrative: ''
		}
	];

	const { Story } = defineMeta({
		title: 'components/MatchBoard',
		tags: ['autodocs']
	});
</script>

<Story name="Empty (no assignments)">
	<MatchBoard {skills} {credentials} editToken="story-token" />
</Story>

<Story name="With pre-assigned credentials">
	<MatchBoard {skills} {credentials} initialAssignments={preAssigned} editToken="story-token" />
</Story>

<Story name="No credentials">
	<MatchBoard {skills} credentials={[]} editToken="story-token" />
</Story>
