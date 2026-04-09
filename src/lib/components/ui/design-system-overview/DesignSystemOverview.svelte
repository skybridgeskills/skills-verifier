<div class="max-w-2xl space-y-6">
	<header class="space-y-2">
		<h1 class="text-headline-md text-foreground">Kinetic Professional</h1>
		<p class="text-body-md text-muted-foreground">Design system overview for Skills Verifier.</p>
	</header>

	<section class="space-y-3">
		<h2 class="text-title-lg text-foreground">Three Color Layers</h2>
		<p class="text-body-md leading-relaxed text-foreground">
			The palette is built around three semantic layers. <strong>Surfaces</strong> are purple-tinted
			neutrals (background, card, secondary, accent) that create visual depth through tonal shifts
			rather than hard borders. The <strong>Job Role</strong> layer is a deep purple used for
			primary actions, headings, and active states. The
			<strong>User Skill</strong> layer splits into <em>flame</em> (orange — individual skill
			actions, intensity) and <em>warmth</em> (gold — proficiency, medium-heat feedback). Each layer has
			muted and subtle variants for badges and backgrounds. Every token has a light and dark mode pair.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-title-lg text-foreground">Typography & Spacing</h2>
		<p class="text-body-md leading-relaxed text-foreground">
			The typeface is <strong>Inter</strong>. Five editorial utilities define the type scale:
			<code class="rounded bg-muted px-1 py-0.5 text-xs">text-display-lg</code> for heroes,
			<code class="rounded bg-muted px-1 py-0.5 text-xs">text-headline-md</code> for page titles,
			<code class="rounded bg-muted px-1 py-0.5 text-xs">text-title-lg</code> for section headings,
			<code class="rounded bg-muted px-1 py-0.5 text-xs">text-body-md</code> for body text, and
			<code class="rounded bg-muted px-1 py-0.5 text-xs">text-label-md</code> for overlines. The
			base radius is 0.75 rem; cards and containers use
			<code class="rounded bg-muted px-1 py-0.5 text-xs">rounded-xl</code>. Ambient shadow (<code
				class="rounded bg-muted px-1 py-0.5 text-xs">shadow-ambient</code
			>) provides lift without hard borders.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-title-lg text-foreground">Key Patterns</h2>
		<p class="text-body-md leading-relaxed text-foreground">
			Buttons default to a purple gradient (<code class="rounded bg-muted px-1 py-0.5 text-xs"
				>from-primary to-primary-container</code
			>); a <em>flame</em> variant exists for skill-related actions. Badges include semantic
			<code class="rounded bg-muted px-1 py-0.5 text-xs">flame-subtle</code> and
			<code class="rounded bg-muted px-1 py-0.5 text-xs">warmth-subtle</code> variants mapped to
			entity types. Inputs and textareas use a ghost-border style (<code
				class="rounded bg-muted px-1 py-0.5 text-xs">bg-accent border-input/15</code
			>) that brightens on focus. Tonal stacking (e.g. a
			<code class="rounded bg-muted px-1 py-0.5 text-xs">bg-secondary</code> inset) should only be
			used when anchored by a visible heading or label — otherwise, ambient shadow alone separates
			cards from the page. All responsive behavior uses container queries (<code
				class="rounded bg-muted px-1 py-0.5 text-xs">@md:</code
			>,
			<code class="rounded bg-muted px-1 py-0.5 text-xs">@lg:</code>) instead of viewport
			breakpoints.
		</p>
	</section>
</div>
