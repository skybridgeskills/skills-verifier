<script lang="ts" module>
	export type FlameLevel = 'low' | 'steady' | 'high';
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	const levelLabel: Record<FlameLevel, string> = {
		low: 'Low',
		steady: 'Steady',
		high: 'High'
	};

	interface Props {
		/** Heat band: low, steady (warmth), or high (flame). */
		level: FlameLevel;
		class?: string;
	}

	let { level, class: className }: Props = $props();

	const segments = $derived(
		{
			low: ['bg-border', 'bg-accent', 'bg-accent'],
			steady: ['bg-warmth-subtle', 'bg-warmth', 'bg-accent'],
			high: ['bg-warmth-subtle', 'bg-flame-muted', 'bg-flame']
		}[level]
	);

	const labelColor = $derived(
		{
			low: 'text-muted-foreground',
			steady: 'text-warmth',
			high: 'text-flame font-black'
		}[level]
	);
</script>

<div class={cn('space-y-2', className)}>
	<div class="flex items-center justify-between">
		<span class="text-label-md tracking-wider text-muted-foreground uppercase">
			Heat intensity
		</span>
		<span class="text-label-md uppercase {labelColor}">
			{levelLabel[level]}
		</span>
	</div>
	<div class="flex h-1.5 w-full gap-1 rounded-full bg-accent">
		<div class="h-full w-1/3 rounded-l-full {segments[0]}"></div>
		<div class="h-full w-1/3 {segments[1]}"></div>
		<div class="h-full w-1/3 rounded-r-full {segments[2]}"></div>
	</div>
</div>
