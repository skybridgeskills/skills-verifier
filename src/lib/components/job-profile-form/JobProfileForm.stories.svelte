<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within, waitFor } from 'storybook/test';

	import JobProfileForm from './JobProfileForm.svelte';

	const { Story } = defineMeta({
		title: 'components/JobProfileForm',
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

<Story
	name="Validation Errors"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the form
		const form = canvasElement.querySelector('form') as HTMLFormElement;

		// Trigger form submission directly to bypass native validation
		// This allows our custom validation to run
		const submitEvent = new SubmitEvent('submit', {
			bubbles: true,
			cancelable: true,
			submitter: form.querySelector('button[type="submit"]') as HTMLButtonElement
		});
		form.dispatchEvent(submitEvent);

		// Wait for validation error messages to appear
		await waitFor(
			() => {
				expect(canvas.getByText('Job name is required')).toBeInTheDocument();
				expect(canvas.getByText('Description is required')).toBeInTheDocument();
				expect(canvas.getByText('Company name is required')).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);
	}}
>
	<div class="max-w-md">
		<JobProfileForm onSubmit={handleSubmit} />
	</div>
</Story>

<Story name="Responsive Layout">
	<div class="w-full @md:max-w-lg @lg:max-w-xl">
		<JobProfileForm onSubmit={handleSubmit} />
	</div>
</Story>
