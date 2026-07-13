<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';
	import { deriveVerificationOutcome } from '$lib/verification/verification-status.js';

	import CredentialColumn from './CredentialColumn.svelte';
	import SkillColumn from './SkillColumn.svelte';
	import type { ClientAssignment, ClientCredential, VerificationProblem } from './types.js';

	import { enhance } from '$app/forms';

	interface Props {
		skills: Skill[];
		credentials: ClientCredential[];
		/** Presentation-level (VP) problems, surfaced in the banner and the overall outcome. */
		presentationProblems?: VerificationProblem[];
		/** Persisted assignments from the match load. */
		initialAssignments?: ClientAssignment[];
		/** Capability token re-posted with the save so the server can re-authorize the edit. */
		editToken: string;
		/** Called once a save succeeds (so the page can reveal the capability + share links). */
		onSaved?: () => void;
	}

	let {
		skills,
		credentials,
		presentationProblems = [],
		initialAssignments = [],
		editToken,
		onSaved
	}: Props = $props();

	// Overall verification outcome across the presentation + every credential's problems. Independent
	// of the exchange's complete/invalid state so non-fatal warnings still surface as `warning`.
	const allProblems = $derived<VerificationProblem[]>([
		...presentationProblems,
		...credentials.flatMap((c) => c.problems)
	]);
	const outcome = $derived(deriveVerificationOutcome(allProblems));
	const hasPresentationProblems = $derived(presentationProblems.length > 0);

	// "Keep this match for" expiry preset, posted as `expiryDays` (default 30) and refreshed on save.
	let expiryDays = $state<30 | 60 | 90>(30);

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
					onSaved?.();
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
		<input type="hidden" name="editToken" value={editToken} />

		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-headline-md text-foreground">Match skills to credentials</h1>
				<p class="mt-1 text-body-md text-muted-foreground">
					Assign verified credentials to job skills and explain each match.
				</p>
			</div>
			<div class="flex items-end gap-4">
				<div class="flex flex-col gap-1">
					<label for="expiryDays" class="text-body-sm font-medium text-foreground">
						Keep this match for
					</label>
					<select
						id="expiryDays"
						name="expiryDays"
						bind:value={expiryDays}
						class="h-9 rounded-lg border border-border/15 bg-background px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
						data-testid="expiry-select"
					>
						<option value={30}>30 days</option>
						<option value={60}>60 days</option>
						<option value={90}>90 days</option>
					</select>
				</div>
				<Button type="submit" data-testid="save-assignments" disabled={saveState === 'saving'}>
					{saveState === 'saving' ? 'Saving…' : 'Save assignments'}
				</Button>
			</div>
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

	{#if outcome === 'warning'}
		<Alert
			class="border-warmth/40 bg-warmth-subtle text-foreground"
			data-testid="verification-banner"
			data-outcome="warning"
		>
			<TriangleAlert class="size-4 text-warmth" />
			<AlertTitle>Some credentials have warnings</AlertTitle>
			<AlertDescription class="text-muted-foreground">
				You can still assign them to skills. Review each credential's warnings before you share.
				{#if hasPresentationProblems}
					The presentation itself could not be fully verified.
				{/if}
			</AlertDescription>
		</Alert>
	{:else if outcome === 'invalid'}
		<Alert variant="destructive" data-testid="verification-banner" data-outcome="invalid">
			<CircleX class="size-4" />
			<AlertTitle>Some credentials could not be fully verified</AlertTitle>
			<AlertDescription>
				You can still assign them to skills, but review the problems first — some checks failed.
				{#if hasPresentationProblems}
					The presentation signature could not be verified.
				{/if}
			</AlertDescription>
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
