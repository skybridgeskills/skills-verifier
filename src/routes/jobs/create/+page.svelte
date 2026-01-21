<script lang="ts">
	import CreateJobPage from '$lib/pages/CreateJobPage.svelte';
	import { createFrameworkService } from '$lib/services/framework-service';

	// Create framework service instance based on environment configuration
	const frameworkService = createFrameworkService();
</script>

<CreateJobPage service={frameworkService} />
