<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SkillProficiencyCard from './SkillProficiencyCard.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Skill Proficiency Card',
		tags: ['autodocs']
	});

	const sample = {
		title: 'Kubernetes orchestration',
		description:
			'Designing scalable microservices infrastructure and multi-cluster management for production workloads.'
	};

	const credential = {
		name: 'CKA certified',
		issuer: 'Verified via Linux Foundation'
	};
</script>

<script lang="ts">
	import type { SkillProficiency } from './SkillProficiencyCard.svelte';

	let interactiveProficiency = $state<SkillProficiency | undefined>(undefined);
</script>

<Story name="Default (no proficiency)">
	<div class="max-w-md">
		<SkillProficiencyCard {...sample} />
	</div>
</Story>

<Story name="Novice">
	<div class="max-w-md">
		<SkillProficiencyCard {...sample} proficiency="novice" />
	</div>
</Story>

<Story name="Proficient">
	<div class="max-w-md">
		<SkillProficiencyCard {...sample} proficiency="proficient" />
	</div>
</Story>

<Story name="Expert with credential">
	<div class="max-w-md">
		<SkillProficiencyCard {...sample} proficiency="expert" {credential} />
	</div>
</Story>

<Story name="Interactive">
	<div class="max-w-md">
		<SkillProficiencyCard
			{...sample}
			proficiency={interactiveProficiency}
			onProficiencyChange={(p: SkillProficiency) => {
				interactiveProficiency = p;
			}}
		/>
	</div>
</Story>
