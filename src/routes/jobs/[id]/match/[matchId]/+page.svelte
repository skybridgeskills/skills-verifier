<script lang="ts">
	import MatchPage from '$lib/pages/MatchPage.svelte';

	let { data } = $props();
</script>

<MatchPage
	job={data.job}
	match={data.match}
	canEdit={data.canEdit}
	editToken={data.editToken}
	embedMode={data.embedMode}
	learnCardHostOrigin={data.learnCardHostOrigin}
/>
