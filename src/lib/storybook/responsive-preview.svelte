<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Viewport width; container queries (`@lg:` etc.) resolve against this box. */
		width?: number;
		/** Banner label; defaults to `Preview ({width}px)`. */
		label?: string;
		children: Snippet;
	}

	let { width = 375, label, children }: Props = $props();

	const banner = $derived(label ?? `Preview (${width}px)`);
</script>

<!--
  Local stand-in for monorepo `ResponsivePreview`: fixed-width wrapper with
  `@container` so components using container queries behave predictably in Storybook.
-->
<div
	class="@container box-content overflow-x-auto rounded border-2 border-border bg-background"
	style:width="{width}px"
	style:max-width="min(100%, {width}px)"
>
	<div class="bg-muted px-2 py-1 text-xs font-medium text-foreground">{banner}</div>
	<div class="p-2">
		{@render children()}
	</div>
</div>
