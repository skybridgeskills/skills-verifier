<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';

	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';

	import { page } from '$app/state';

	interface Props {
		job: JobResource;
		open?: boolean;
	}

	let { job, open = $bindable(false) }: Props = $props();

	const jobUrl = $derived(`${page.url.origin}/jobs/${job.id}`);

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(jobUrl);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-xl">
		<DialogHeader>
			<DialogTitle>Invite applicants to share their skills match</DialogTitle>
			<DialogDescription>
				Paste this link into your job posting or application. Candidates who open it can verify
				their credentials and share a skills-match record back for this role.
			</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-2">
			<label for="job-share-url" class="text-sm font-medium text-foreground">Job link</label>
			<div class="flex items-center gap-2">
				<input
					id="job-share-url"
					type="text"
					readonly
					value={jobUrl}
					class="min-w-0 flex-1 rounded-lg border border-border/15 bg-muted px-3 py-2 font-mono text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:border-border/30"
					onfocus={(e) => e.currentTarget.select()}
				/>
				<Button type="button" variant="secondary" onclick={copyLink} aria-label="Copy job link">
					{#if copied}
						<CheckIcon aria-hidden="true" />
						Copied
					{:else}
						<CopyIcon aria-hidden="true" />
						Copy
					{/if}
				</Button>
			</div>
			<span aria-live="polite" class="sr-only">{copied ? 'Link copied to clipboard' : ''}</span>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => (open = false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
