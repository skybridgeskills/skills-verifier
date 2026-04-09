<script lang="ts">
	/**
	 * Documentation grid for Kinetic Professional tokens (surfaces, Job Role, flame, warmth).
	 * Uses semantic Tailwind classes so swatches track `layout.css` and light/dark mode.
	 */
	type Token = {
		name: string;
		swatchClass: string;
		textClass: string;
		label: string;
	};

	const surfaceTokens: Token[] = [
		{
			name: 'background',
			swatchClass: 'bg-background',
			textClass: 'text-foreground',
			label: 'Background'
		},
		{
			name: 'card',
			swatchClass: 'bg-card',
			textClass: 'text-card-foreground',
			label: 'Card'
		},
		{
			name: 'secondary',
			swatchClass: 'bg-secondary',
			textClass: 'text-secondary-foreground',
			label: 'Surface Low'
		},
		{
			name: 'muted',
			swatchClass: 'bg-muted',
			textClass: 'text-muted-foreground',
			label: 'Muted surface'
		},
		{
			name: 'accent',
			swatchClass: 'bg-accent',
			textClass: 'text-accent-foreground',
			label: 'Surface High'
		}
	];

	const primaryTokens: Token[] = [
		{
			name: 'primary',
			swatchClass: 'bg-primary',
			textClass: 'text-primary-foreground',
			label: 'Primary'
		},
		{
			name: 'primary-container',
			swatchClass: 'bg-primary-container',
			textClass: 'text-primary-foreground',
			label: 'Primary Container'
		},
		{
			name: 'primary-fixed',
			swatchClass: 'bg-primary-fixed',
			textClass: 'text-primary',
			label: 'Primary Fixed'
		}
	];

	const flameTokens: Token[] = [
		{
			name: 'flame',
			swatchClass: 'bg-flame',
			textClass: 'text-flame-foreground',
			label: 'Flame'
		},
		{
			name: 'flame-end',
			swatchClass: 'bg-flame-end',
			textClass: 'text-flame-foreground',
			label: 'Flame gradient end'
		},
		{
			name: 'flame-muted',
			swatchClass: 'bg-flame-muted',
			textClass: 'text-foreground',
			label: 'Flame Muted'
		},
		{
			name: 'flame-subtle',
			swatchClass: 'bg-flame-subtle',
			textClass: 'text-flame',
			label: 'Flame Subtle'
		}
	];

	const warmthTokens: Token[] = [
		{
			name: 'warmth',
			swatchClass: 'bg-warmth',
			textClass: 'text-foreground dark:text-warmth-subtle',
			label: 'Warmth'
		},
		{
			name: 'warmth-end',
			swatchClass: 'bg-warmth-end',
			textClass: 'text-primary-foreground dark:text-foreground',
			label: 'Warmth gradient end'
		},
		{
			name: 'warmth-muted',
			swatchClass: 'bg-warmth-muted',
			textClass: 'text-warmth dark:text-warmth',
			label: 'Warmth Muted'
		},
		{
			name: 'warmth-subtle',
			swatchClass: 'bg-warmth-subtle',
			textClass: 'text-warmth dark:text-warmth',
			label: 'Warmth Subtle'
		}
	];

	const functionalTokens: Token[] = [
		{
			name: 'destructive',
			swatchClass: 'bg-destructive',
			textClass: 'text-destructive-foreground',
			label: 'Destructive'
		},
		{
			name: 'border',
			swatchClass: 'bg-border',
			textClass: 'text-foreground',
			label: 'Border'
		}
	];
</script>

<div class="space-y-12">
	<header class="max-w-3xl space-y-2">
		<h1 class="text-headline-md text-foreground">Kinetic Professional</h1>
		<p class="text-body-md text-muted-foreground">
			Semantic colors from <code class="rounded-md bg-muted px-1 py-0.5 text-xs">layout.css</code>.
			Toggle Storybook / system theme to preview light and dark values.
		</p>
	</header>

	<section class="space-y-4" aria-labelledby="palette-surfaces">
		<h2 id="palette-surfaces" class="text-title-lg text-foreground">Surfaces</h2>
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-3 @lg:grid-cols-5">
			{#each surfaceTokens as token (token.name)}
				<div class="flex flex-col gap-1.5">
					<div
						class="flex h-16 w-full items-end rounded-lg p-2 {token.swatchClass} {token.textClass}"
					>
						<span class="text-label-md">{token.label}</span>
					</div>
					<code class="text-xs break-all text-muted-foreground">bg-{token.name}</code>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4" aria-labelledby="palette-job-role">
		<h2 id="palette-job-role" class="text-title-lg text-foreground">Job Role layer</h2>
		<p class="text-body-md text-muted-foreground">
			Deep purple — authority, job context, primary CTAs.
		</p>
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-3">
			{#each primaryTokens as token (token.name)}
				<div class="flex flex-col gap-1.5">
					<div
						class="flex h-16 w-full items-end rounded-lg p-2 {token.swatchClass} {token.textClass}"
					>
						<span class="text-label-md">{token.label}</span>
					</div>
					<code class="text-xs break-all text-muted-foreground">bg-{token.name}</code>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4" aria-labelledby="palette-flame">
		<h2 id="palette-flame" class="text-title-lg text-foreground">User Skill — flame</h2>
		<p class="text-body-md text-muted-foreground">
			Heat and intensity — skill actions, expert states, flame gradients.
		</p>
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-4">
			{#each flameTokens as token (token.name)}
				<div class="flex flex-col gap-1.5">
					<div
						class="flex h-16 w-full items-end rounded-lg p-2 {token.swatchClass} {token.textClass}"
					>
						<span class="text-label-md">{token.label}</span>
					</div>
					<code class="text-xs break-all text-muted-foreground">bg-{token.name}</code>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4" aria-labelledby="palette-warmth">
		<h2 id="palette-warmth" class="text-title-lg text-foreground">User Skill — warmth</h2>
		<p class="text-body-md text-muted-foreground">Gold tones — proficient / medium heat.</p>
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-3">
			{#each warmthTokens as token (token.name)}
				<div class="flex flex-col gap-1.5">
					<div
						class="flex h-16 w-full items-end rounded-lg p-2 {token.swatchClass} {token.textClass}"
					>
						<span class="text-label-md">{token.label}</span>
					</div>
					<code class="text-xs break-all text-muted-foreground">bg-{token.name}</code>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4" aria-labelledby="palette-functional">
		<h2 id="palette-functional" class="text-title-lg text-foreground">Functional</h2>
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-3">
			{#each functionalTokens as token (token.name)}
				<div class="flex flex-col gap-1.5">
					<div
						class="flex h-16 w-full items-end rounded-lg p-2 {token.swatchClass} {token.textClass}"
					>
						<span class="text-label-md">{token.label}</span>
					</div>
					<code class="text-xs break-all text-muted-foreground">bg-{token.name}</code>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4" aria-labelledby="palette-type">
		<h2 id="palette-type" class="text-title-lg text-foreground">Typography scale</h2>
		<div class="space-y-6 rounded-xl bg-card p-8 shadow-ambient">
			<div>
				<span class="text-display-lg text-foreground">Display Large (3.5rem)</span>
			</div>
			<div>
				<span class="text-headline-md text-foreground">Headline Medium (1.75rem)</span>
			</div>
			<div>
				<span class="text-title-lg text-foreground">Title Large (1.25rem)</span>
			</div>
			<div>
				<span class="text-body-md text-foreground">Body Medium (0.875rem)</span>
			</div>
			<div>
				<span class="text-label-md text-muted-foreground">Label Medium (0.75rem)</span>
			</div>
		</div>
	</section>
</div>
