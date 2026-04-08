<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { QUICK_PICKS, SAMPLE_OCCUPATIONS } from '$lib/config/sample-entities';

	import QuickPicks from './QuickPicks.svelte';

	const { Story } = defineMeta({
		title: 'components/QuickPicks/QuickPicks',
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div class="max-w-xl">
		<QuickPicks picks={QUICK_PICKS.slice(0, 6)} selectedUrls={[]} onTogglePick={() => {}} />
	</div>
</Story>

<Story name="With Selections">
	<div class="max-w-xl">
		<QuickPicks
			picks={QUICK_PICKS.slice(0, 6)}
			selectedUrls={[
				'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
				'https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac'
			]}
			onTogglePick={() => {}}
		/>
	</div>
</Story>

<Story name="Occupations Only">
	<div class="max-w-xl">
		<QuickPicks picks={SAMPLE_OCCUPATIONS} selectedUrls={[]} onTogglePick={() => {}} />
	</div>
</Story>

<Story name="Mixed Types">
	{@const mixedPicks = [
		QUICK_PICKS[0],
		SAMPLE_OCCUPATIONS[0],
		QUICK_PICKS[1],
		SAMPLE_OCCUPATIONS[1],
		QUICK_PICKS[2]
	]}
	<div class="max-w-xl">
		<QuickPicks picks={mixedPicks} selectedUrls={[]} onTogglePick={() => {}} />
	</div>
</Story>
