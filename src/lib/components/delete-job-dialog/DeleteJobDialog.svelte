<script lang="ts">
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

	interface Props {
		job: JobResource;
		open?: boolean;
	}

	let { job, open = $bindable(false) }: Props = $props();
</script>

<Dialog bind:open>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle>Delete this job?</DialogTitle>
			<DialogDescription>
				<strong>{job.name}</strong> and all of its skills-match records and applications will be permanently
				deleted. This is intended for clearing test data and cannot be undone.
			</DialogDescription>
		</DialogHeader>

		<DialogFooter>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<form method="POST" action="?/deleteJob">
				<Button type="submit" variant="destructive">Delete job</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>
