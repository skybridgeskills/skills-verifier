<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { Skill } from '$lib/types/job-profile';

	import SkillItem from './SkillItem.svelte';

	const skillWithLabelOnly: Skill = {
		url: 'https://example.com/skill1',
		label: 'Health Information Systems',
		ctid: 'ce-skill-1'
	};

	const skillWithTextOnly: Skill = {
		url: 'https://example.com/skill2',
		text: 'Describe health care organizations from the perspective of key stakeholders.',
		ctid: 'ce-skill-2'
	};

	const skillWithBoth: Skill = {
		url: 'https://example.com/skill3',
		label: 'Health Information Systems',
		text: 'Understand and use health information systems effectively.',
		ctid: 'ce-skill-3'
	};

	const { Story } = defineMeta({
		title: 'components/SkillItem',
		tags: ['autodocs']
	});
</script>

<Story name="With Label and Text">
	<div class="max-w-md rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<SkillItem skill={skillWithBoth} />
		</div>
	</div>
</Story>

<Story name="With Label Only">
	<div class="max-w-md rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<SkillItem skill={skillWithLabelOnly} />
		</div>
	</div>
</Story>

<Story name="With Text Only">
	<div class="max-w-md rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<SkillItem skill={skillWithTextOnly} />
		</div>
	</div>
</Story>

<Story name="No CTID shown">
	<div class="max-w-md rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<SkillItem skill={{ ...skillWithBoth, ctid: '' }} />
		</div>
	</div>
</Story>

<Story name="Long text">
	<div class="max-w-md rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<SkillItem
				skill={{
					url: 'https://example.com/long',
					label: 'Data governance',
					text: 'Plan, implement, and monitor enterprise-wide data governance programs including stewardship, quality standards, lineage documentation, regulatory alignment, and stakeholder communication across distributed teams and legacy systems.',
					ctid: 'ce-long-text'
				}}
			/>
		</div>
	</div>
</Story>
