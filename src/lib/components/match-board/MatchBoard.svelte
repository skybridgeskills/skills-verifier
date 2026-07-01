<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';

	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';

	import CredentialColumn from './CredentialColumn.svelte';
	import SkillColumn from './SkillColumn.svelte';
	import type { ClientAssignment, ClientCredential } from './types.js';

	import { enhance } from '$app/forms';

	interface Props {
		skills: Skill[];
		credentials: ClientCredential[];
		/** Persisted assignments from the match load. */
		initialAssignments?: ClientAssignment[];
	}

	let { skills, credentials, initialAssignments = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	let assignments = $state<ClientAssignment[]>(initialAssignments.map((a) => ({ ...a })));
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveError = $state<string | null>(null);

	const credentialIds = $derived(new Set(credentials.map((c) => c.credentialId)));
	// Only persist assignments whose credential is still on the match (server rejects unknown refs).
	const validAssignments = $derived(assignments.filter((a) => credentialIds.has(a.credentialId)));

	function exists(skillCtid: string, skillUrl: string, credentialId: string): boolean {
		return assignments.some(
			(a) => a.skillCtid === skillCtid && a.skillUrl === skillUrl && a.credentialId === credentialId
		);
	}

	function assign(skill: Skill, credentialId: string) {
		if (!credentialIds.has(credentialId)) return; // ignore stray drops
		if (exists(skill.ctid, skill.url, credentialId)) return; // prevent duplicate pairs
		assignments = [
			...assignments,
			{ skillCtid: skill.ctid, skillUrl: skill.url, credentialId, narrative: '' }
		];
		saveState = 'idle';
	}

	function removeAssignment(target: ClientAssignment) {
		assignments = assignments.filter(
			(a) =>
				!(
					a.skillCtid === target.skillCtid &&
					a.skillUrl === target.skillUrl &&
					a.credentialId === target.credentialId
				)
		);
		saveState = 'idle';
	}

	function setNarrative(target: ClientAssignment, value: string) {
		assignments = assignments.map((a) =>
			a.skillCtid === target.skillCtid &&
			a.skillUrl === target.skillUrl &&
			a.credentialId === target.credentialId
				? { ...a, narrative: value }
				: a
		);
		saveState = 'idle';
	}
</script>

<div class="space-y-6">
	<form
		method="POST"
		action="?/saveAssignments"
		use:enhance={() => {
			saveState = 'saving';
			saveError = null;
			return async ({ result, update }) => {
				if (result.type === 'success') {
					saveState = 'saved';
				} else if (result.type === 'failure') {
					saveState = 'error';
					saveError = (result.data?.error as string | undefined) ?? 'Could not save assignments.';
				} else {
					saveState = 'error';
					saveError = 'Could not save assignments.';
				}
				await update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="assignmentsJson" value={JSON.stringify(validAssignments)} />

		<div class="flex items-center justify-between gap-4">
			<div>
				<h1 class="text-headline-md text-foreground">Match skills to credentials</h1>
				<p class="mt-1 text-body-md text-muted-foreground">
					Assign verified credentials to job skills and explain each match.
				</p>
			</div>
			<Button type="submit" data-testid="save-assignments" disabled={saveState === 'saving'}>
				{saveState === 'saving' ? 'Saving…' : 'Save assignments'}
			</Button>
		</div>
	</form>

	{#if saveState === 'saved'}
		<Alert class="border-flame/40 bg-flame-subtle text-foreground" data-testid="save-status">
			<CircleCheck class="size-4 text-flame" />
			<AlertTitle>Assignments saved</AlertTitle>
		</Alert>
	{:else if saveState === 'error'}
		<Alert variant="destructive" data-testid="save-status">
			<AlertTitle>Could not save</AlertTitle>
			<AlertDescription>{saveError}</AlertDescription>
		</Alert>
	{/if}

	<div class="grid gap-6 @4xl:grid-cols-2" data-testid="match-board">
		<SkillColumn
			{skills}
			{assignments}
			{credentials}
			onDropCredential={(skill, credentialId) => assign(skill, credentialId)}
			onRemoveAssignment={removeAssignment}
			onNarrativeInput={setNarrative}
		/>
		<CredentialColumn {credentials} {skills} isAssigned={exists} onAssign={assign} />
	</div>
</div>
