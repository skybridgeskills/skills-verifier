<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		'flex field-sizing-content min-h-16 w-full rounded-lg border border-input/15 bg-accent px-3 py-2 text-base shadow-xs ring-offset-background transition-[color,box-shadow,background-color,border-color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-accent dark:aria-invalid:ring-destructive/40',
		className
	)}
	bind:value
	{...restProps}
></textarea>
