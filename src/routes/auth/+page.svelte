<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const nextValue = $derived(form?.next ?? data.next ?? '/');
</script>

<div class="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center gap-8">
	<div>
		<h1 class="text-headline-md text-foreground">Admin sign in</h1>
		<p class="mt-2 text-body-md text-muted-foreground">Enter the admin password to continue.</p>
	</div>

	{#if form?.error}
		<Alert variant="destructive">
			<AlertTitle>Sign in failed</AlertTitle>
			<AlertDescription>{form.error}</AlertDescription>
		</Alert>
	{/if}

	<form method="POST" use:enhance class="space-y-6">
		<input type="hidden" name="next" value={nextValue} />
		<div class="space-y-2">
			<Label for="password">Password</Label>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
				data-testid="password"
			/>
		</div>
		<Button type="submit" class="w-full" data-testid="submit-button">Sign in</Button>
	</form>
</div>
