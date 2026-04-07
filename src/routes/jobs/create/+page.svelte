<script lang="ts">
	import CreateJobPage from '$lib/pages/CreateJobPage.svelte';

	let { form } = $props();
</script>

<CreateJobPage form={form ?? undefined} />
