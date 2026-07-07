<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Mail from '@lucide/svelte/icons/mail';

	import type { Skill } from '$lib/types/job-profile';

	import type { BadgeDetail } from './badge-detail.js';
	import type { ClientAssignment, ClientCredential } from './types.js';

	interface Props {
		skills: Skill[];
		credentials: ClientCredential[];
		assignments: ClientAssignment[];
		/** Optional per-credential badge details (issuer/achievement) for the read-only view. */
		details?: Record<string, BadgeDetail>;
	}

	let { skills, credentials, assignments, details = {} }: Props = $props();

	const credentialById = $derived(new Map(credentials.map((c) => [c.credentialId, c])));

	function credentialName(credentialId: string): string {
		return (
			details[credentialId]?.achievementName?.trim() ||
			credentialById.get(credentialId)?.name?.trim() ||
			credentialId
		);
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
							{@const detail = details[a.credentialId]}
							<li class="flex gap-3">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-flame" aria-hidden="true" />
								<div class="min-w-0">
									<p class="text-body-md font-medium text-foreground">
										{credentialName(a.credentialId)}
									</p>
									{#if detail?.issuerName}
										<p class="text-body-sm mt-0.5 text-muted-foreground">
											Issued by
											{#if detail.issuerUrl}
												<!-- External, user-supplied issuer website (not internal SvelteKit
												     navigation), so resolve() does not apply. -->
												<!-- eslint-disable svelte/no-navigation-without-resolve -->
												<a
													href={detail.issuerUrl}
													target="_blank"
													rel="noopener noreferrer"
													class="font-medium text-primary hover:underline"
												>
													{detail.issuerName}
												</a>
												<!-- eslint-enable svelte/no-navigation-without-resolve -->
											{:else}
												<span class="font-medium text-foreground">{detail.issuerName}</span>
											{/if}
										</p>
									{/if}
									{#if detail?.issuerEmail}
										<p class="text-body-sm mt-0.5 flex items-center gap-1.5 text-muted-foreground">
											<Mail class="size-3.5 shrink-0" aria-hidden="true" />
											<a href={`mailto:${detail.issuerEmail}`} class="text-primary hover:underline">
												{detail.issuerEmail}
											</a>
										</p>
									{/if}
									{#if a.narrative.trim()}
										<p class="mt-0.5 text-body-md text-muted-foreground">{a.narrative}</p>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{/if}
</div>
