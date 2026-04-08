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
		/** When true, render fields only (parent supplies the form element). */
		embedded?: boolean;
	}

	let { onSubmit, initialData = {}, embedded = false }: Props = $props();

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

	const fieldClass = 'mt-1';

	function preventEnterSubmit(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	}
</script>

{#if embedded}
	<div class="space-y-4">
		<div>
			<Label for="job-name">
				Job Name <span class="text-destructive">*</span>
			</Label>
			<Input
				id="job-name"
				name="name"
				type="text"
				bind:value={name}
				required
				class={cn(fieldClass, nameError ? 'border-destructive' : '')}
				placeholder="e.g., Senior Software Engineer"
				onkeydown={preventEnterSubmit}
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
				name="company"
				type="text"
				bind:value={company}
				required
				class={cn(fieldClass, companyError ? 'border-destructive' : '')}
				placeholder="e.g., Acme Corporation"
				onkeydown={preventEnterSubmit}
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
				name="description"
				bind:value={description}
				required
				rows={3}
				class={cn(fieldClass, descriptionError ? 'border-destructive' : '')}
				placeholder="One-sentence job description"
				onkeydown={preventEnterSubmit}
			/>
			{#if descriptionError}
				<p class="mt-1 text-sm text-destructive">{descriptionError}</p>
			{/if}
		</div>
	</div>
{:else}
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
				class={cn(fieldClass, nameError ? 'border-destructive' : '')}
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
				class={cn(fieldClass, companyError ? 'border-destructive' : '')}
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
				class={cn(fieldClass, descriptionError ? 'border-destructive' : '')}
				placeholder="One-sentence job description"
			/>
			{#if descriptionError}
				<p class="mt-1 text-sm text-destructive">{descriptionError}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full @md:w-auto">Save Job Profile</Button>
	</form>
{/if}
