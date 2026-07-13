<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Mail from '@lucide/svelte/icons/mail';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	import { cn } from '$lib/utils.js';
	import { deriveVerificationOutcome } from '$lib/verification/verification-status.js';

	import type { BadgeDetail } from './badge-detail.js';
	import type { VerificationProblem } from './types.js';

	interface Props {
		/** Resolved display name (callers fall back to the credential id upstream). */
		name: string;
		detail?: BadgeDetail;
		problems?: VerificationProblem[];
		/** Tighter layout (smaller title/image) for the nested assigned box. */
		compact?: boolean;
		class?: string;
	}

	let { name, detail, problems = [], compact = false, class: className }: Props = $props();

	let problemsOpen = $state(false);

	const outcome = $derived(deriveVerificationOutcome(problems));
	// Capitalized so it can be rendered directly as a dynamic component (`<StatusIcon />`).
	const StatusIcon = $derived(
		outcome === 'invalid' ? CircleX : outcome === 'warning' ? TriangleAlert : BadgeCheck
	);
	const statusTint = $derived(
		outcome === 'invalid'
			? 'text-destructive'
			: outcome === 'warning'
				? 'text-warmth'
				: 'text-flame'
	);
	const statusLabel = $derived(
		outcome === 'invalid'
			? 'Not fully verified'
			: outcome === 'warning'
				? 'Has warnings'
				: 'Verified'
	);

	/** Format a raw ISO string to a readable date; guard unparseable input. */
	function formatDate(iso: string | undefined): string | undefined {
		if (!iso) return undefined;
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return undefined;
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	const issuedOn = $derived(formatDate(detail?.validFrom));
	const expiresOn = $derived(formatDate(detail?.validUntil));

	const problemsId = $props.id();
</script>

<div class={cn('min-w-0', className)}>
	<div class="flex items-start gap-3">
		{#if detail?.imageUrl}
			<!-- User-supplied badge image; extractor accepts only http(s):/data: URLs. -->
			<img
				src={detail.imageUrl}
				alt={name}
				class={cn(
					'shrink-0 rounded-lg border border-border/15 object-cover',
					compact ? 'size-10' : 'size-12'
				)}
			/>
		{/if}
		<div class="min-w-0 flex-1">
			<div
				class={cn(
					'leading-tight font-semibold text-foreground',
					compact ? 'text-body-md' : 'truncate text-title-lg'
				)}
			>
				{name}
			</div>
			{#if detail?.issuerName}
				<p class="text-body-sm mt-0.5 truncate text-muted-foreground">
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
		</div>
	</div>

	{#if issuedOn || expiresOn}
		<div class="text-body-sm mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
			{#if issuedOn}
				<span>Issued {issuedOn}</span>
			{/if}
			{#if expiresOn}
				<span>Expires {expiresOn}</span>
			{/if}
		</div>
	{/if}

	<div class="mt-2">
		{#if problems.length > 0}
			<button
				type="button"
				class={cn(
					'text-body-sm flex items-center gap-1.5 font-medium transition-colors hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
					statusTint
				)}
				aria-expanded={problemsOpen}
				aria-controls={problemsId}
				onclick={() => (problemsOpen = !problemsOpen)}
				data-testid="credential-problems-toggle"
			>
				<StatusIcon class="size-4 shrink-0" aria-hidden="true" />
				{statusLabel}
				<span class="text-muted-foreground">
					· {problemsOpen ? 'Hide' : 'View'}
					{problems.length}
					{problems.length === 1 ? 'problem' : 'problems'}
				</span>
				<ChevronDown
					class={cn('size-4 transition-transform', problemsOpen && 'rotate-180')}
					aria-hidden="true"
				/>
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
		{:else}
			<div class={cn('text-body-sm flex items-center gap-1.5 font-medium', statusTint)}>
				<StatusIcon class="size-4 shrink-0" aria-hidden="true" />
				{statusLabel}
			</div>
		{/if}
	</div>

	{#if detail?.description}
		<p class="text-body-sm mt-2 text-muted-foreground">{detail.description}</p>
	{/if}
</div>
