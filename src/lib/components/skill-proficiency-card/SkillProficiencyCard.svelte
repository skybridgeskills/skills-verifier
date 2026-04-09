<script lang="ts" module>
	export type SkillProficiency = 'novice' | 'proficient' | 'expert';
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Flame from '@lucide/svelte/icons/flame';

	import { SkillFlameMeter, type FlameLevel } from '$lib/components/skill-flame-meter/index.js';
	import { cn } from '$lib/utils.js';

	/**
	 * Match-style skill card: proficiency control, {@link SkillFlameMeter}, optional credential.
	 * Storybook reference until wired to a route.
	 */
	interface Props {
		title: string;
		description: string;
		proficiency?: SkillProficiency;
		credential?: { name: string; issuer: string };
		onProficiencyChange?: (level: SkillProficiency) => void;
		class?: string;
	}

	let {
		title,
		description,
		proficiency,
		credential,
		onProficiencyChange,
		class: className
	}: Props = $props();

	const flameLevel = $derived<FlameLevel>(
		proficiency === 'expert' ? 'high' : proficiency === 'proficient' ? 'steady' : 'low'
	);

	const flameIconClass = $derived(
		proficiency === 'expert'
			? 'text-flame'
			: proficiency === 'proficient'
				? 'text-warmth'
				: 'text-muted-foreground'
	);

	function levelButtonClass(level: SkillProficiency): string {
		const base =
			'flex-1 rounded-lg py-2 text-[10px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
		const idle = 'bg-accent text-muted-foreground hover:bg-muted';
		const on = {
			novice: 'scale-105 bg-primary-fixed text-primary shadow-md',
			proficient: 'scale-105 bg-warmth-subtle text-foreground shadow-md dark:text-warmth',
			expert: 'scale-105 bg-flame text-flame-foreground shadow-md'
		} satisfies Record<SkillProficiency, string>;
		return cn(base, proficiency === level ? on[level] : idle);
	}

	function selectLevel(level: SkillProficiency) {
		onProficiencyChange?.(level);
	}
</script>

<div
	class={cn(
		'relative overflow-hidden rounded-xl bg-card p-8 text-card-foreground shadow-ambient',
		className
	)}
>
	{#if proficiency === 'expert'}
		<div
			class="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-linear-to-b from-transparent to-flame/10 opacity-50"
			aria-hidden="true"
		></div>
	{/if}

	<div class="relative z-10 space-y-8">
		<div class="flex items-start justify-between gap-4">
			<h3 class="text-2xl font-bold tracking-tight text-primary">{title}</h3>
			<Flame class={cn('size-6 shrink-0', flameIconClass)} aria-hidden="true" />
		</div>

		<p class="text-body-md leading-relaxed text-muted-foreground">{description}</p>

		<div class="space-y-4">
			<span
				class="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-60"
			>
				Proficiency level
			</span>
			<div class="flex gap-2">
				<button
					type="button"
					class={levelButtonClass('novice')}
					onclick={() => selectLevel('novice')}
				>
					Novice
				</button>
				<button
					type="button"
					class={levelButtonClass('proficient')}
					onclick={() => selectLevel('proficient')}
				>
					Proficient
				</button>
				<button
					type="button"
					class={levelButtonClass('expert')}
					onclick={() => selectLevel('expert')}
				>
					Expert
				</button>
			</div>
		</div>

		<SkillFlameMeter level={flameLevel} />

		{#if credential}
			<div class="flex items-center gap-3 rounded-xl border border-border/15 bg-secondary p-3">
				<div
					class="flex size-10 items-center justify-center rounded-lg bg-card text-primary shadow-sm"
				>
					<CircleCheck class="size-5" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-[10px] leading-none font-black text-primary uppercase">
						{credential.name}
					</div>
					<div class="mt-1 text-[9px] font-medium text-muted-foreground">
						{credential.issuer}
					</div>
				</div>
				<CircleCheck class="size-4 shrink-0 text-flame" aria-hidden="true" />
			</div>
		{:else}
			<div
				class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/30 p-4 text-muted-foreground opacity-40 transition-all hover:border-primary/30 hover:opacity-100"
			>
				<CirclePlus class="mb-1 size-5" aria-hidden="true" />
				<span class="text-[10px] font-bold tracking-widest uppercase"> Drop badge to verify </span>
			</div>
		{/if}
	</div>
</div>
