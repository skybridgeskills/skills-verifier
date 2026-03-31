<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<!-- Fallback only when this file is loaded without +page.server.ts (e.g. isolated tests). -->
<p><a href={resolve('/jobs/create')}>Create job</a></p>
