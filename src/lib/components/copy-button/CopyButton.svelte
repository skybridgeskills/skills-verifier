<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';

	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		/** Text copied to the clipboard on click. */
		value: string;
		/** Visible button label (defaults to "Copy"). */
		label?: string;
		variant?: 'default' | 'outline' | 'secondary' | 'ghost';
		class?: string;
		'data-testid'?: string;
	}

	let {
		value,
		label = 'Copy',
		variant = 'outline',
		class: className,
		'data-testid': testId
	}: Props = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			clearTimeout(timeout);
			timeout = setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard can be unavailable (insecure context / denied). Leave state unchanged.
		}
	}
</script>

<Button type="button" {variant} class={className} onclick={copy} data-testid={testId}>
	{#if copied}
		<Check class="size-4" aria-hidden="true" />
	{:else}
		<Copy class="size-4" aria-hidden="true" />
	{/if}
	{copied ? 'Copied' : label}
</Button>
<span class="sr-only" role="status" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
