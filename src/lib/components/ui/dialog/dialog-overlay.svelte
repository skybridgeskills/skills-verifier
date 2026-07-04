<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.OverlayProps> = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="dialog-overlay"
	class={cn(
		'fixed inset-0 z-50 bg-foreground/50 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
		className
	)}
	{...restProps}
/>
