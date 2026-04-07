<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Skill } from '$lib/types/job-profile';

	interface Props {
		skills: Skill[];
		selectedUrls: string[];
		onToggleSkill: (skill: Skill) => void;
	}

	let { skills, selectedUrls, onToggleSkill }: Props = $props();

	function isSelected(skill: Skill): boolean {
		return selectedUrls.includes(skill.url);
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each skills as skill (skill.url)}
		<Button
			type="button"
			variant={isSelected(skill) ? 'default' : 'outline'}
			size="sm"
			class="text-left"
			onclick={() => onToggleSkill(skill)}
		>
			{skill.label ?? skill.text}
		</Button>
	{/each}
</div>
