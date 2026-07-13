<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	import { SkillItem } from '$lib/components/skill-item/index.js';
	import type { Skill } from '$lib/types/job-profile';
	import { cn } from '$lib/utils.js';

	import AssignmentNarrative from './AssignmentNarrative.svelte';
	import BadgeMetadata from './BadgeMetadata.svelte';
	import type { ClientAssignment, ClientCredential } from './types.js';

	interface Props {
		skills: Skill[];
		assignments: ClientAssignment[];
		credentials: ClientCredential[];
		/** Drop a credential (by id) onto a skill. */
		onDropCredential: (skill: Skill, credentialId: string) => void;
		onRemoveAssignment: (assignment: ClientAssignment) => void;
		onNarrativeInput: (assignment: ClientAssignment, value: string) => void;
	}

	let {
		skills,
		assignments,
		credentials,
		onDropCredential,
		onRemoveAssignment,
		onNarrativeInput
	}: Props = $props();

	let dragOverCtid = $state<string | null>(null);

	const credentialById = $derived(new Map(credentials.map((c) => [c.credentialId, c])));

	function assignmentsFor(skill: Skill): ClientAssignment[] {
		return assignments.filter((a) => a.skillCtid === skill.ctid && a.skillUrl === skill.url);
	}

	function credentialFor(credentialId: string): ClientCredential | undefined {
		return credentialById.get(credentialId);
	}

	function credentialName(credentialId: string): string {
		const c = credentialById.get(credentialId);
		return c?.name?.trim() || credentialId;
	}

	function handleDrop(event: DragEvent, skill: Skill) {
		event.preventDefault();
		dragOverCtid = null;
		const credentialId =
			event.dataTransfer?.getData('application/x-credential-id') ||
			event.dataTransfer?.getData('text/plain') ||
			'';
		if (credentialId) onDropCredential(skill, credentialId);
	}

	function handleDragOver(event: DragEvent, skill: Skill) {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
		dragOverCtid = skill.ctid;
	}
</script>

<div class="space-y-4">
	<h2 class="text-label-md tracking-wider text-primary uppercase">Job skills</h2>
	<div class="space-y-4">
		{#each skills as skill (skill.url)}
			{@const skillAssignments = assignmentsFor(skill)}
			<div
				role="group"
				aria-label="Skill {skill.label?.trim() || skill.text?.trim() || skill.ctid}"
				data-testid="skill-drop-{skill.ctid}"
				ondragover={(e) => handleDragOver(e, skill)}
				ondragleave={() => (dragOverCtid = null)}
				ondrop={(e) => handleDrop(e, skill)}
				class={cn(
					'rounded-xl border bg-card p-4 shadow-ambient transition-colors',
					dragOverCtid === skill.ctid ? 'border-primary/60 bg-primary-fixed' : 'border-primary/15'
				)}
			>
				<div class="flex items-start gap-2">
					<div class="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true"></div>
					<SkillItem {skill} />
				</div>

				{#if skillAssignments.length === 0}
					<div
						class="mt-3 rounded-lg border-2 border-dashed border-border/30 p-3 text-center text-xs font-medium text-muted-foreground"
					>
						Drag a credential here, or use “Assign to skill…” on a card.
					</div>
				{:else}
					<ul class="mt-3 space-y-3">
						{#each skillAssignments as assignment (assignment.credentialId)}
							{@const credential = credentialFor(assignment.credentialId)}
							<li class="rounded-lg border border-border/40 bg-card p-3 shadow-ambient">
								<div class="flex items-start justify-between gap-2">
									<BadgeMetadata
										class="flex-1"
										compact
										name={credentialName(assignment.credentialId)}
										detail={credential?.detail}
										problems={credential?.problems ?? []}
									/>
									<button
										type="button"
										class="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
										onclick={() => onRemoveAssignment(assignment)}
										aria-label="Remove {credentialName(assignment.credentialId)} from skill"
										data-testid="remove-assignment"
									>
										<X class="size-3.5" aria-hidden="true" />
										<span class="sr-only sm:not-sr-only">Remove</span>
									</button>
								</div>
								<div class="mt-2">
									<AssignmentNarrative
										value={assignment.narrative}
										label="Narrative for {credentialName(
											assignment.credentialId
										)} demonstrating {skill.label?.trim() || skill.ctid}"
										onInput={(v) => onNarrativeInput(assignment, v)}
									/>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</div>
