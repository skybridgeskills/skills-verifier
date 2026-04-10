<script lang="ts">
	import type { QuickPickItem, Skill } from '$lib/types/job-profile';

	import QuickPickItemComponent from './QuickPickItem.svelte';

	interface Props {
		picks: QuickPickItem[];
		selectedUrls: string[];
		onTogglePick: (pick: QuickPickItem, skills: Skill[]) => void;
	}

	let { picks, selectedUrls, onTogglePick }: Props = $props();

	function isPickSelected(pick: QuickPickItem): boolean {
		// For skills, check by URL
		if (pick.type === 'Skill') {
			const skill = pick.entity as Skill;
			return selectedUrls.includes(skill.url);
		}
		// For containers/frameworks, check if all their skills are selected
		if (pick.skills && pick.skills.length > 0) {
			return pick.skills.every((s) => selectedUrls.includes(s.url));
		}
		return false;
	}

	function handlePickClick(pick: QuickPickItem) {
		// For containers/frameworks, pass all pre-fetched skills
		// For skills, pass as single-item array
		const skills = pick.skills ?? [pick.entity as Skill];
		onTogglePick(pick, skills);
	}

	function getPickKey(pick: QuickPickItem): string {
		if (pick.type === 'Skill') {
			return (pick.entity as Skill).url;
		}
		// For non-skills, entity has @id
		return (pick.entity as { '@id': string })['@id'];
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each picks as pick (getPickKey(pick))}
		<QuickPickItemComponent
			{pick}
			isSelected={isPickSelected(pick)}
			onClick={() => handlePickClick(pick)}
		/>
	{/each}
</div>
