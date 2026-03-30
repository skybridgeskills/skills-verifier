<script lang="ts">
	import CreateJobPage from '$lib/pages/CreateJobPage.svelte';
	import { createFrameworkService } from '$lib/server/clients/framework-client/framework-client';

	// Create framework service instance based on environment configuration
	const frameworkService = createFrameworkService();
</script>

<CreateJobPage service={frameworkService} />
