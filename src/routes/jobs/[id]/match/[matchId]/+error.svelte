<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';

	import { page } from '$app/state';

	const isExpired = $derived(page.status === 410);
</script>

<div class="mx-auto max-w-lg space-y-4 rounded-xl bg-card p-8 text-center shadow-ambient">
	{#if isExpired}
		<Clock class="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
		<h1 class="text-headline-md text-foreground">This match has expired</h1>
		<p class="text-body-md text-muted-foreground">
			This skills match is no longer available. Matches are kept for a limited time — ask the
			applicant to create and share a new one.
		</p>
	{:else}
		<h1 class="text-headline-md text-foreground">Something went wrong</h1>
		<p class="text-body-md text-muted-foreground">
			{page.error?.message ?? 'This page could not be loaded.'}
		</p>
	{/if}
</div>
