<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { cn } from '$lib/utils';

	interface JobProfileFormData {
		name: string;
		description: string;
		company: string;
	}

	interface Props {
		onSubmit?: (data: JobProfileFormData) => void;
		initialData?: Partial<JobProfileFormData>;
	}

	let { onSubmit, initialData = {} }: Props = $props();

	// Extract initial values using a function to avoid reactive reference warnings
	const getInitialValue = (key: keyof NonNullable<Props['initialData']>) => {
		return initialData?.[key] || '';
	};

	let name = $state(getInitialValue('name'));
	let description = $state(getInitialValue('description'));
	let company = $state(getInitialValue('company'));

	let nameError = $state('');
	let descriptionError = $state('');
	let companyError = $state('');

	function validate(): boolean {
		let isValid = true;

		// Reset errors
		nameError = '';
		descriptionError = '';
		companyError = '';

		// Validate name
		if (!name.trim()) {
			nameError = 'Job name is required';
			isValid = false;
		}

		// Validate description
		if (!description.trim()) {
			descriptionError = 'Description is required';
			isValid = false;
		}

		// Validate company
		if (!company.trim()) {
			companyError = 'Company name is required';
			isValid = false;
		}

		return isValid;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (validate()) {
			onSubmit?.({
				name: name.trim(),
				description: description.trim(),
				company: company.trim()
			});
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<Label for="job-name">
			Job Name <span class="text-destructive">*</span>
		</Label>
		<Input
			id="job-name"
			type="text"
			bind:value={name}
			required
			class={cn('mt-1', nameError ? 'border-destructive' : '')}
			placeholder="e.g., Senior Software Engineer"
		/>
		{#if nameError}
			<p class="mt-1 text-sm text-destructive">{nameError}</p>
		{/if}
	</div>

	<div>
		<Label for="company">
			Company <span class="text-destructive">*</span>
		</Label>
		<Input
			id="company"
			type="text"
			bind:value={company}
			required
			class={cn('mt-1', companyError ? 'border-destructive' : '')}
			placeholder="e.g., Acme Corporation"
		/>
		{#if companyError}
			<p class="mt-1 text-sm text-destructive">{companyError}</p>
		{/if}
	</div>

	<div>
		<Label for="description">
			Description <span class="text-destructive">*</span>
		</Label>
		<Textarea
			id="description"
			bind:value={description}
			required
			rows={3}
			class={cn('mt-1', descriptionError ? 'border-destructive' : '')}
			placeholder="One-sentence job description"
		/>
		{#if descriptionError}
			<p class="mt-1 text-sm text-destructive">{descriptionError}</p>
		{/if}
	</div>

	<Button type="submit" class="w-full @md:w-auto">Save Job Profile</Button>
</form>
