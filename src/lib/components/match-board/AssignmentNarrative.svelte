<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	interface Props {
		/** Two-way bound narrative text for this (skill, credential) assignment. */
		value: string;
		/** Accessible label distinguishing this narrative from others on the page. */
		label: string;
		onInput: (value: string) => void;
	}

	let { value, label, onInput }: Props = $props();

	const id = $props.id();
</script>

<div class="space-y-1">
	<label for={id} class="text-label-md tracking-wider text-muted-foreground uppercase">
		Why does this credential demonstrate this skill?
	</label>
	<Textarea
		{id}
		{value}
		aria-label={label}
		data-testid="assignment-narrative"
		rows={2}
		maxlength={500}
		placeholder="A sentence or two of context…"
		oninput={(e) => onInput((e.currentTarget as HTMLTextAreaElement).value)}
	/>
	<p class="text-right text-xs text-muted-foreground">{value.length}/500</p>
</div>
