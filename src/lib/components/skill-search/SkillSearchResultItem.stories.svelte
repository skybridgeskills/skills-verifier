<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SkillSearchResultItem from './SkillSearchResultItem.svelte';

	const { Story } = defineMeta({
		title: 'components/SkillSearch/SkillSearchResultItem',
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div class="max-w-md">
		<SkillSearchResultItem
			skill={{
				url: 'https://example.com/skills/js',
				label: 'JavaScript Programming',
				text: 'Writing and maintaining JavaScript code for web applications.',
				ctid: 'ce-js-prog'
			}}
			isSelected={false}
			onSelect={() => {}}
		/>
	</div>
</Story>

<Story name="Selected">
	<div class="max-w-md">
		<SkillSearchResultItem
			skill={{
				url: 'https://example.com/skills/js',
				label: 'JavaScript Programming',
				text: 'Writing and maintaining JavaScript code for web applications.',
				ctid: 'ce-js-prog'
			}}
			isSelected={true}
			onSelect={() => {}}
		/>
	</div>
</Story>

<Story name="Minimal">
	<div class="max-w-md">
		<SkillSearchResultItem
			skill={{
				url: 'https://example.com/skills/react',
				text: 'React',
				ctid: 'ce-react'
			}}
			isSelected={false}
			onSelect={() => {}}
		/>
	</div>
</Story>
