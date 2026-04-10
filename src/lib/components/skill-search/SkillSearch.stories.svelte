<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';

	import SkillSearch from './SkillSearch.svelte';

	const onToggleSkill = fn();

	const { Story } = defineMeta({
		title: 'components/SkillSearch/SkillSearch',
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Drill-down after picking a job, occupation, or framework is covered in **CtdlSkillContainerView** stories (SkillSearch uses the same view once a result is selected).'
				}
			}
		}
	});
</script>

<Story name="Default">
	<div class="max-w-xl">
		<SkillSearch selectedUrls={[]} {onToggleSkill} />
	</div>
</Story>

<Story name="With prior selection">
	<div class="max-w-xl">
		<SkillSearch
			selectedUrls={[
				'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641'
			]}
			{onToggleSkill}
		/>
	</div>
</Story>

<Story name="Containers mode (initial tab)">
	<div class="max-w-xl">
		<SkillSearch selectedUrls={[]} initialMode="containers" {onToggleSkill} />
	</div>
</Story>

<Story name="Frameworks mode (initial tab)">
	<div class="max-w-xl">
		<SkillSearch selectedUrls={[]} initialMode="frameworks" {onToggleSkill} />
	</div>
</Story>
