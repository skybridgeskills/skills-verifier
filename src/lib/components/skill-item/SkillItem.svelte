<script lang="ts">
	import type { Skill } from '$lib/types/job-profile';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils';

	interface Props {
		skill: Skill;
		selected: boolean;
		onToggle: (url: string) => void;
	}

	let { skill, selected, onToggle }: Props = $props();

	function handleCheckedChange() {
		// Toggle when checkbox state changes (both checked and unchecked)
		onToggle(skill.url);
	}
</script>

{#if skill}
	<Label
		class={cn(
			'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors @md:p-4',
			selected ? 'border-primary bg-accent' : 'border-border bg-card hover:border-border'
		)}
	>
		<div class="flex shrink-0 items-center pt-0.5">
			<Checkbox checked={selected} onCheckedChange={handleCheckedChange} />
		</div>
		<div class="flex-1">
			{#if skill.label && skill.text}
				<!-- Both label and text present -->
				<div class="leading-tight font-medium text-foreground">{skill.label}</div>
				<div class="mt-1 text-sm leading-tight text-muted-foreground">{skill.text}</div>
			{:else if skill.label}
				<!-- Label only -->
				<div class="leading-tight font-medium text-foreground">{skill.label}</div>
			{:else}
				<!-- Text only (fallback) -->
				<div class="leading-tight text-foreground">{skill.text}</div>
			{/if}
		</div>
	</Label>
{/if}
