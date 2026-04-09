<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SkillFlameMeter from './SkillFlameMeter.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Skill Flame Meter',
		tags: ['autodocs']
	});
</script>

<Story name="Low">
	<div class="max-w-sm rounded-xl bg-card p-8 shadow-ambient">
		<SkillFlameMeter level="low" />
	</div>
</Story>

<Story name="Steady">
	<div class="max-w-sm rounded-xl bg-card p-8 shadow-ambient">
		<SkillFlameMeter level="steady" />
	</div>
</Story>

<Story name="High">
	<div class="max-w-sm rounded-xl bg-card p-8 shadow-ambient">
		<SkillFlameMeter level="high" />
	</div>
</Story>
