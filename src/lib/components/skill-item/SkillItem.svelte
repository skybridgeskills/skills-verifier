<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skill: Skill;
	}

	let { skill }: Props = $props();

	const title = $derived(skill.label?.trim() || skill.text?.trim() || skill.ctid);
	const subtitle = $derived(
		skill.label && skill.text?.trim() && skill.text.trim() !== skill.label.trim()
			? skill.text.trim()
			: null
	);
</script>

<div class="min-w-0 flex-1">
	<div class="text-title-lg leading-tight font-semibold text-foreground">{title}</div>
	{#if subtitle}
		<p class="mt-1 text-body-md leading-tight text-muted-foreground">{subtitle}</p>
	{/if}
	{#if skill.ctid}
		<p class="mt-1 font-mono text-label-md text-muted-foreground">{skill.ctid}</p>
	{/if}
</div>
