<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	import DialogOverlay from './dialog-overlay.svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		showCloseButton = true,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		showCloseButton?: boolean;
		children: Snippet;
	} = $props();
</script>

<DialogPrimitive.Portal {...portalProps}>
	<DialogOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'fixed top-1/2 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-border/15 bg-popover p-6 text-popover-foreground shadow-lg dark:border-border/30',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				class="absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<XIcon class="size-4" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
