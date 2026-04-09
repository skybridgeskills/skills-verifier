<script lang="ts">
	import { ThemeToggle } from '$lib/components/theme-toggle/index.js';

	import { resolve } from '$app/paths';
</script>

<header class="sticky top-0 z-50 bg-background/80 backdrop-blur-xl dark:bg-background/80">
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
		<a
			href={resolve('/')}
			class="text-lg font-black tracking-tighter text-primary transition-opacity hover:opacity-90"
		>
			Skills Verifier
		</a>
		<nav class="flex flex-1 items-center justify-end gap-4">
			<a
				href={resolve('/jobs')}
				class="text-body-md font-medium text-muted-foreground transition-colors hover:text-primary"
			>
				Jobs
			</a>
			<a
				href={resolve('/jobs/create')}
				class="text-body-md font-medium text-muted-foreground transition-colors hover:text-primary"
			>
				Create job
			</a>
			<ThemeToggle />
		</nav>
	</div>
</header>
