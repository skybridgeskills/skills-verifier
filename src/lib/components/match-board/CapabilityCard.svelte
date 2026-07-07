<script lang="ts">
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Share2 from '@lucide/svelte/icons/share-2';

	import CopyButton from '$lib/components/copy-button/CopyButton.svelte';

	interface Props {
		/** Secret capability URL (`…?edit=<token>`) that unlocks edit + delete. */
		editUrl: string;
		/** Tokenless read-only share URL. */
		shareUrl: string;
	}

	let { editUrl, shareUrl }: Props = $props();
</script>

<div class="space-y-5 rounded-xl bg-card p-6 shadow-ambient" data-testid="capability-card">
	<div class="flex items-start gap-3">
		<KeyRound class="mt-0.5 size-5 shrink-0 text-flame" aria-hidden="true" />
		<div class="min-w-0 flex-1 space-y-2">
			<h2 class="text-title-lg font-semibold text-foreground">Your edit link</h2>
			<p class="text-body-md text-muted-foreground">
				Save this link — it's the only way back to edit or delete this match for now.
			</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<code
					class="text-body-sm min-w-0 flex-1 truncate rounded-lg bg-background px-3 py-2 text-foreground"
					data-testid="edit-url">{editUrl}</code
				>
				<CopyButton value={editUrl} label="Copy edit link" data-testid="copy-edit-url" />
			</div>
		</div>
	</div>

	<div class="flex items-start gap-3 border-t border-border/15 pt-5">
		<Share2 class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
		<div class="min-w-0 flex-1 space-y-2">
			<h2 class="text-title-lg font-semibold text-foreground">Share link</h2>
			<p class="text-body-md text-muted-foreground">
				Share this read-only link in a job application or with an employer.
			</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<code
					class="text-body-sm min-w-0 flex-1 truncate rounded-lg bg-background px-3 py-2 text-foreground"
					data-testid="share-url">{shareUrl}</code
				>
				<CopyButton value={shareUrl} label="Copy share link" data-testid="copy-share-url" />
			</div>
		</div>
	</div>
</div>
