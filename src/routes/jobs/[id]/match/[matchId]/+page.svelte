<script lang="ts">
	import MatchPage from '$lib/pages/MatchPage.svelte';

	let { data } = $props();
</script>

<MatchPage job={data.job} match={data.match} />
