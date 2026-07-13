<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { Skill } from '$lib/types/job-profile';

	import MatchBoard from './MatchBoard.svelte';
	import type { ClientAssignment, ClientCredential, VerificationProblem } from './types.js';

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

	/** All-verified credentials (happy path) — every card is clean. */
	const credentials: ClientCredential[] = [
		{
			credentialId: 'cred-cka',
			name: 'Certified Kubernetes Administrator',
			issuer: 'CNCF',
			verified: true,
			problems: []
		},
		{
			credentialId: 'cred-sre',
			name: 'SRE Professional',
			issuer: 'DevOps Institute',
			verified: true,
			problems: []
		},
		{
			credentialId: 'cred-tf',
			name: 'Terraform Associate',
			issuer: 'HashiCorp',
			verified: true,
			problems: []
		}
	];

	const warning: VerificationProblem = {
		check: 'registry.issuer',
		title: 'Issuer not in a trusted registry',
		detail: 'The issuer could not be found in a known trust registry.',
		fatal: false
	};
	const critical: VerificationProblem = {
		check: 'cryptographic.proof.signature',
		title: 'Invalid Signature',
		detail: 'The credential proof could not be cryptographically verified.',
		fatal: true
	};

	/** Mixed credentials: one clean, one with a non-fatal warning, one with a fatal problem. */
	const mixedCredentials: ClientCredential[] = [
		{
			credentialId: 'cred-cka',
			name: 'Certified Kubernetes Administrator',
			issuer: 'CNCF',
			verified: true,
			problems: []
		},
		{
			credentialId: 'cred-sre',
			name: 'SRE Professional',
			issuer: 'DevOps Institute',
			verified: true,
			problems: [warning]
		},
		{
			credentialId: 'cred-tf',
			name: 'Terraform Associate',
			issuer: 'HashiCorp',
			verified: false,
			problems: [critical]
		}
	];

	/** Only non-fatal warnings (drives the amber `warning` banner). */
	const warningCredentials: ClientCredential[] = [
		{
			credentialId: 'cred-cka',
			name: 'Certified Kubernetes Administrator',
			issuer: 'CNCF',
			verified: true,
			problems: []
		},
		{
			credentialId: 'cred-sre',
			name: 'SRE Professional',
			issuer: 'DevOps Institute',
			verified: true,
			problems: [warning]
		}
	];

	const presentationProblem: VerificationProblem = {
		check: 'cryptographic.proof.signature',
		title: 'Presentation signature could not be verified',
		detail: 'The holder-binding proof on the presentation failed to verify.',
		fatal: true
	};

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

<Story name="Warning (non-fatal problems)">
	<MatchBoard {skills} credentials={warningCredentials} editToken="story-token" />
</Story>

<Story name="Invalid (fatal problem + presentation problem)">
	<MatchBoard
		{skills}
		credentials={mixedCredentials}
		presentationProblems={[presentationProblem]}
		editToken="story-token"
	/>
</Story>
