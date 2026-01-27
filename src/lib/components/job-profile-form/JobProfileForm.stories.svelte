<script lang="ts" module>
	import JobProfileForm from './JobProfileForm.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

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

		// Find and click the submit button
		const submitButton = canvas.getByRole('button', { name: /save job profile/i });
		await userEvent.click(submitButton);

		// Wait a bit for validation to run
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Verify validation error messages appear
		await expect(canvas.getByText('Job name is required')).toBeInTheDocument();
		await expect(canvas.getByText('Description is required')).toBeInTheDocument();
		await expect(canvas.getByText('Company name is required')).toBeInTheDocument();
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
