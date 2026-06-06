<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';

	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';
	import { cn } from '$lib/utils.js';

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

	const title = $derived(credential.name?.trim() || credential.credentialId);

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
			class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-flame-subtle text-flame"
		>
			<BadgeCheck class="size-5" aria-hidden="true" />
		</div>
		<div class="min-w-0 flex-1">
			<div class="truncate text-title-lg leading-tight font-semibold text-foreground">{title}</div>
			{#if credential.issuer}
				<div class="mt-0.5 truncate text-body-md text-muted-foreground">{credential.issuer}</div>
			{/if}
		</div>
	</div>

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
