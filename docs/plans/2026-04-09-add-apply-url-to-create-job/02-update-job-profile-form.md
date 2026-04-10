# Phase 2: Update JobProfileForm Component

## Scope of phase

Add the "Apply URL" input field to the `JobProfileForm` component with:

1. New state variable for `externalUrl`
2. Updated `JobProfileFormData` interface to include `externalUrl`
3. Client-side URL validation (optional field, but if provided must be valid http/https URL)
4. Input field rendering in both `embedded` and non-embedded modes

## Code Organization Reminders

- Place state variables after existing ones
- Place validation logic with existing validation functions
- Place input field markup with existing fields
- Keep both `embedded` and non-embedded render paths in sync
- Extract validation error message strings as constants if needed

## Style conventions

- Use `camelCase` for variables (`externalUrl`, `externalUrlError`)
- Use optional chaining and nullish coalescing for initial values
- Follow existing patterns for error display (red border + error message)
- Use same field class and styling as other inputs

## Implementation Details

### File: `src/lib/components/job-profile-form/JobProfileForm.svelte`

#### 1. Update `JobProfileFormData` interface (lines 8-12)

Add `externalUrl` as optional string:

```typescript
interface JobProfileFormData {
	name: string;
	description: string;
	company: string;
	externalUrl?: string;
}
```

#### 2. Add state variables (after line 30)

```typescript
let externalUrl = $state(getInitialValue('externalUrl'));
```

#### 3. Add error state (after line 34)

```typescript
let externalUrlError = $state('');
```

#### 4. Update `validate()` function (lines 36-63)

Add validation for `externalUrl`:

```typescript
function validate(): boolean {
	let isValid = true;

	// Reset errors
	nameError = '';
	descriptionError = '';
	companyError = '';
	externalUrlError = ''; // Add this

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

	// Validate externalUrl if provided (optional field)
	const trimmedUrl = externalUrl.trim();
	if (trimmedUrl) {
		try {
			const url = new URL(trimmedUrl);
			if (url.protocol !== 'http:' && url.protocol !== 'https:') {
				externalUrlError = 'URL must start with http:// or https://';
				isValid = false;
			}
		} catch {
			externalUrlError = 'Please enter a valid URL';
			isValid = false;
		}
	}

	return isValid;
}
```

#### 5. Update `handleSubmit()` (lines 65-75)

Include `externalUrl` in the submitted data (only if not empty):

```typescript
function handleSubmit(event: SubmitEvent) {
	event.preventDefault();

	if (validate()) {
		const trimmedUrl = externalUrl.trim();
		onSubmit?.({
			name: name.trim(),
			description: description.trim(),
			company: company.trim(),
			externalUrl: trimmedUrl || undefined
		});
	}
}
```

#### 6. Add input field in embedded mode (after line 124, before the closing `</div>`)

```svelte
<div>
	<Label for="external-url">Apply URL</Label>
	<Input
		id="external-url"
		name="externalUrl"
		type="url"
		bind:value={externalUrl}
		class={cn(fieldClass, externalUrlError ? 'border-destructive' : '')}
		placeholder="https://example.com/jobs/apply"
		onkeydown={preventEnterSubmit}
	/>
	{#if externalUrlError}
		<p class="mt-1 text-sm text-destructive">{externalUrlError}</p>
	{/if}
</div>
```

#### 7. Add input field in non-embedded mode (after line 179, before the submit button)

Add the same input block (without `name` attribute since non-embedded mode doesn't use form submission):

```svelte
<div>
	<Label for="external-url">Apply URL</Label>
	<Input
		id="external-url"
		type="url"
		bind:value={externalUrl}
		class={cn(fieldClass, externalUrlError ? 'border-destructive' : '')}
		placeholder="https://example.com/jobs/apply"
	/>
	{#if externalUrlError}
		<p class="mt-1 text-sm text-destructive">{externalUrlError}</p>
	{/if}
</div>
```

## Validate

Run type checking and tests:

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier && pnpm check
```

Expected: No TypeScript errors. The component should compile successfully.
