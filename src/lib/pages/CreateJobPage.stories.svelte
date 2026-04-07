<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CreateJobPage from './CreateJobPage.svelte';

	const { Story } = defineMeta({
		title: 'pages/CreateJobPage',
		argTypes: {},
		args: {}
	});
</script>

<Story name="Initial State">
	<div class="max-w-6xl">
		<CreateJobPage />
	</div>
</Story>

<Story name="With form error">
	<div class="max-w-6xl">
		<CreateJobPage
			form={{ error: 'Example server validation message', values: { name: '', company: '' } }}
		/>
	</div>
</Story>
