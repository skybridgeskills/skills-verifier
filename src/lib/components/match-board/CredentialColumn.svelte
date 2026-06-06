<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	import CredentialCard from './CredentialCard.svelte';
	import type { ClientCredential } from './types.js';

	interface Props {
		credentials: ClientCredential[];
		skills: Skill[];
		isAssigned: (skillCtid: string, skillUrl: string, credentialId: string) => boolean;
		onAssign: (skill: Skill, credentialId: string) => void;
	}

	let { credentials, skills, isAssigned, onAssign }: Props = $props();
</script>

<div class="space-y-4">
	<h2 class="text-label-md tracking-wider text-flame uppercase">Verified credentials</h2>
	{#if credentials.length === 0}
		<p class="text-body-md text-muted-foreground">No verified credentials yet.</p>
	{:else}
		<div class="space-y-4">
			{#each credentials as credential (credential.credentialId)}
				<CredentialCard
					{credential}
					{skills}
					isAssigned={(ctid, url) => isAssigned(ctid, url, credential.credentialId)}
					onAssign={(skill) => onAssign(skill, credential.credentialId)}
				/>
			{/each}
		</div>
	{/if}
</div>
