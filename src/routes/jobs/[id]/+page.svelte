<script lang="ts">
	import JobDetailPage from '$lib/pages/JobDetailPage.svelte';

	let { data } = $props();
</script>

<JobDetailPage job={data.job} />
