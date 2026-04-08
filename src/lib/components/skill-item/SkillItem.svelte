<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
	}

	let { skill }: Props = $props();

	const title = $derived(skill.label ?? skill.text);
	const subtitle = $derived(
		skill.label && skill.text && skill.text !== skill.label ? skill.text : null
	);
</script>

<div class="min-w-0 flex-1">
	<div class="leading-tight font-medium text-foreground">{title}</div>
	{#if subtitle}
		<p class="mt-1 text-sm leading-tight text-muted-foreground">{subtitle}</p>
	{/if}
	{#if skill.ctid}
		<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
	{/if}
</div>
