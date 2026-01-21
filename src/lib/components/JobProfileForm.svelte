<script lang="ts">
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
				company: company.trim(),
			});
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="job-name" class="block text-sm font-medium text-gray-700">
			Job Name <span class="text-red-500">*</span>
		</label>
		<input
			id="job-name"
			type="text"
			bind:value={name}
			required
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 @md:text-sm {nameError
				? 'border-red-300'
				: ''}"
			placeholder="e.g., Senior Software Engineer"
		/>
		{#if nameError}
			<p class="mt-1 text-sm text-red-600">{nameError}</p>
		{/if}
	</div>

	<div>
		<label for="company" class="block text-sm font-medium text-gray-700">
			Company <span class="text-red-500">*</span>
		</label>
		<input
			id="company"
			type="text"
			bind:value={company}
			required
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 @md:text-sm {companyError
				? 'border-red-300'
				: ''}"
			placeholder="e.g., Acme Corporation"
		/>
		{#if companyError}
			<p class="mt-1 text-sm text-red-600">{companyError}</p>
		{/if}
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700">
			Description <span class="text-red-500">*</span>
		</label>
		<textarea
			id="description"
			bind:value={description}
			required
			rows="3"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 @md:text-sm {descriptionError
				? 'border-red-300'
				: ''}"
			placeholder="One-sentence job description"
		></textarea>
		{#if descriptionError}
			<p class="mt-1 text-sm text-red-600">{descriptionError}</p>
		{/if}
	</div>

	<button
		type="submit"
		class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 @md:w-auto"
	>
		Save Job Profile
	</button>
</form>
