<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	import BadgeMetadata from './BadgeMetadata.svelte';
	import type { ClientAssignment, ClientCredential } from './types.js';

	interface Props {
		skills: Skill[];
		credentials: ClientCredential[];
		assignments: ClientAssignment[];
	}

	let { skills, credentials, assignments }: Props = $props();

	const credentialById = $derived(new Map(credentials.map((c) => [c.credentialId, c])));

	function credentialFor(credentialId: string): ClientCredential | undefined {
		return credentialById.get(credentialId);
	}

	function credentialName(credentialId: string): string {
		const c = credentialById.get(credentialId);
		return c?.detail?.achievementName?.trim() || c?.name?.trim() || credentialId;
	}

	function assignmentsFor(skill: Skill): ClientAssignment[] {
		return assignments.filter((a) => a.skillCtid === skill.ctid && a.skillUrl === skill.url);
	}

	const matchedSkills = $derived(skills.filter((s) => assignmentsFor(s).length > 0));
</script>

<div class="space-y-4" data-testid="match-summary">
	{#if matchedSkills.length === 0}
		<p class="text-body-md text-muted-foreground">
			No verified credentials have been matched to this role's skills yet.
		</p>
	{:else}
		<ul class="space-y-4">
			{#each matchedSkills as skill (skill.ctid + skill.url)}
				<li class="rounded-xl bg-card p-5 shadow-ambient">
					<h3 class="text-title-md font-semibold text-foreground">{skill.text}</h3>
					<ul class="mt-3 space-y-3">
						{#each assignmentsFor(skill) as a (a.credentialId)}
							{@const credential = credentialFor(a.credentialId)}
							<li class="rounded-lg border border-border/40 p-3">
								<BadgeMetadata
									compact
									name={credentialName(a.credentialId)}
									detail={credential?.detail}
									problems={credential?.problems ?? []}
								/>
								{#if a.narrative.trim()}
									<p class="mt-2 text-body-md text-muted-foreground">{a.narrative}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{/if}
</div>
