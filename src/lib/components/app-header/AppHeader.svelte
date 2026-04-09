<script lang="ts">
	import { ThemeToggle } from '$lib/components/theme-toggle/index.js';

	import { resolve } from '$app/paths';
</script>

<header
	class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
		<a href={resolve('/')} class="text-lg font-semibold tracking-tight text-foreground">
			Skills Verifier
		</a>
		<nav class="flex flex-1 items-center justify-end gap-4">
			<a
				href={resolve('/jobs')}
				class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				Jobs
			</a>
			<a
				href={resolve('/jobs/create')}
				class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				Create job
			</a>
			<ThemeToggle />
		</nav>
	</div>
</header>
