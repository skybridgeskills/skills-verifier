<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';
	import { cn } from '$lib/utils.js';
	import { deriveVerificationOutcome } from '$lib/verification/verification-status.js';

	import type { ClientCredential } from './types.js';

	interface Props {
		credential: ClientCredential;
		/** Job skills available as assignment targets (for the accessible fallback picker). */
		skills: Skill[];
		/** Predicate so already-assigned (skill, credential) pairs can be disabled in the picker. */
		isAssigned: (skillCtid: string, skillUrl: string) => boolean;
		/** Accessible-fallback assign action. */
		onAssign: (skill: Skill) => void;
		class?: string;
	}

	let { credential, skills, isAssigned, onAssign, class: className }: Props = $props();

	let selectedSkillUrl = $state('');
	// Per-card disclosure for this credential's verification problems (collapsed by default).
	let problemsOpen = $state(false);

	const title = $derived(credential.name?.trim() || credential.credentialId);

	// The card's own status (independent of the board banner): valid / warning / invalid.
	const problems = $derived(credential.problems ?? []);
	const cardOutcome = $derived(deriveVerificationOutcome(problems));
	// Capitalized so it can be rendered directly as a dynamic component (`<StatusIcon />`).
	const StatusIcon = $derived(
		cardOutcome === 'invalid' ? CircleX : cardOutcome === 'warning' ? TriangleAlert : BadgeCheck
	);
	// Icon container tint keyed to the outcome; matches the flame/warmth/destructive design tokens.
	const statusTint = $derived(
		cardOutcome === 'invalid'
			? 'bg-destructive/10 text-destructive'
			: cardOutcome === 'warning'
				? 'bg-warmth-subtle text-warmth'
				: 'bg-flame-subtle text-flame'
	);
	const statusLabel = $derived(
		cardOutcome === 'invalid'
			? 'Not fully verified'
			: cardOutcome === 'warning'
				? 'Has warnings'
				: 'Verified'
	);

	function skillLabel(skill: Skill): string {
		return skill.label?.trim() || skill.text?.trim() || skill.ctid;
	}

	function handleDragStart(event: DragEvent) {
		event.dataTransfer?.setData('text/plain', credential.credentialId);
		event.dataTransfer?.setData('application/x-credential-id', credential.credentialId);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
	}

	function applyAssign() {
		const skill = skills.find((s) => s.url === selectedSkillUrl);
		if (skill) {
			onAssign(skill);
			selectedSkillUrl = '';
		}
	}

	const pickerId = $props.id();
	// Derived from the single `$props.id()` (Svelte disallows calling it twice per component).
	const problemsId = $derived(`${pickerId}-problems`);
</script>

<div
	role="group"
	aria-label="Credential {title}"
	draggable="true"
	ondragstart={handleDragStart}
	data-testid="credential-card"
	data-credential-id={credential.credentialId}
	class={cn(
		'rounded-xl border border-flame/20 bg-card p-4 shadow-ambient transition-shadow focus-within:ring-2 focus-within:ring-ring/30 hover:shadow-lg',
		className
	)}
>
	<div class="flex items-start gap-3">
		<GripVertical
			class="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground"
			aria-hidden="true"
		/>
		<div
			class={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', statusTint)}
			title={statusLabel}
		>
			<StatusIcon class="size-5" aria-hidden="true" />
			<span class="sr-only">{statusLabel}</span>
		</div>
		<div class="min-w-0 flex-1">
			<div class="truncate text-title-lg leading-tight font-semibold text-foreground">{title}</div>
			{#if credential.issuer}
				<div class="mt-0.5 truncate text-body-md text-muted-foreground">{credential.issuer}</div>
			{/if}
		</div>
	</div>

	{#if problems.length > 0}
		<div class="mt-3">
			<button
				type="button"
				class="text-body-sm flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				aria-expanded={problemsOpen}
				aria-controls={problemsId}
				onclick={() => (problemsOpen = !problemsOpen)}
				data-testid="credential-problems-toggle"
			>
				<ChevronDown
					class={cn('size-4 transition-transform', problemsOpen && 'rotate-180')}
					aria-hidden="true"
				/>
				{problemsOpen ? 'Hide' : 'View'}
				{problems.length}
				{problems.length === 1 ? 'problem' : 'problems'}
			</button>

			{#if problemsOpen}
				<ul id={problemsId} class="mt-2 space-y-2" data-testid="credential-problems">
					{#each problems as problem, i (problem.check ?? '' + problem.title + i)}
						<li class="rounded-lg border border-border/15 bg-background/50 p-2.5">
							<div class="flex items-start gap-2">
								<div class="min-w-0 flex-1">
									<p class="text-body-sm font-medium text-foreground">{problem.title}</p>
									{#if problem.detail}
										<p class="text-body-sm mt-0.5 text-muted-foreground">{problem.detail}</p>
									{/if}
								</div>
								{#if problem.fatal}
									<span
										class="text-label-sm shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive"
									>
										Critical
									</span>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<!-- Accessible / non-drag fallback: pick a skill and assign. -->
	<div class="mt-3 flex flex-wrap items-end gap-2">
		<div class="min-w-0 flex-1">
			<label for={pickerId} class="sr-only">Assign {title} to a skill</label>
			<select
				id={pickerId}
				bind:value={selectedSkillUrl}
				data-testid="assign-skill-select"
				aria-label="Assign {title} to a skill"
				class="h-8 w-full rounded-lg border border-input/15 bg-accent px-2 text-sm text-foreground focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<option value="" disabled>Assign to skill…</option>
				{#each skills as skill (skill.url)}
					<option value={skill.url} disabled={isAssigned(skill.ctid, skill.url)}>
						{skillLabel(skill)}{isAssigned(skill.ctid, skill.url) ? ' (assigned)' : ''}
					</option>
				{/each}
			</select>
		</div>
		<Button
			type="button"
			size="sm"
			variant="secondary"
			disabled={!selectedSkillUrl}
			onclick={applyAssign}
			data-testid="assign-skill-apply"
			aria-label="Assign {title} to selected skill"
		>
			Assign
		</Button>
	</div>
</div>
