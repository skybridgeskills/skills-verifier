<script lang="ts" module>
	import JobProfileForm from './JobProfileForm.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'components/JobProfileForm',
		component: JobProfileForm,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});

	function handleSubmit(data: { name: string; description: string; company: string }) {
		console.log('Form submitted:', data);
		alert(
			`Form submitted:\nName: ${data.name}\nCompany: ${data.company}\nDescription: ${data.description}`
		);
	}
</script>

<Story name="Default">
	<div class="max-w-md">
		<JobProfileForm onSubmit={handleSubmit} />
	</div>
</Story>

<Story name="With Pre-filled Values">
	<div class="max-w-md">
		<JobProfileForm
			onSubmit={handleSubmit}
			initialData={{
				name: 'Senior Software Engineer',
				company: 'Acme Corporation',
				description: 'Lead development of web applications using modern technologies.'
			}}
		/>
	</div>
</Story>

<Story name="Validation Errors">
	<div class="max-w-md">
		<JobProfileForm onSubmit={handleSubmit} />
		<script>
			// Trigger validation by attempting to submit empty form
			setTimeout(() => {
				const form = document.querySelector('form');
				if (form) {
					const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
					if (submitButton) {
						submitButton.click();
					}
				}
			}, 100);
		</script>
	</div>
</Story>

<Story name="Responsive Layout">
	<div class="w-full @md:max-w-lg @lg:max-w-xl">
		<JobProfileForm onSubmit={handleSubmit} />
	</div>
</Story>
