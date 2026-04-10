# Phase 1: Job Detail Page

## Scope of phase

Add the `/jobs/[id]` route with server load, a `JobDetailPage` presentation
component with Storybook stories, and update the job list to link each job title
to the detail page.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- **Domain-first layout**: route at `src/routes/jobs/[id]/`, page at
  `src/lib/pages/JobDetailPage.svelte`.
- **Container queries**: `@md:`, `@lg:` not `md:`, `lg:`.
- **Import order**: external → `$lib/` → relative, blank lines between groups.
- **~200-line files**: the page component should stay concise.
- **File naming**: PascalCase for `.svelte`, kebab-case for `.ts`.

## Implementation Details

### 1. Server load — `src/routes/jobs/[id]/+page.server.ts`

```ts
import { error } from '@sveltejs/kit';

import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const job = await jobByIdQuery({ id: params.id });
	if (!job) {
		error(404, 'Job not found');
	}
	return { job };
};
```

### 2. Route wrapper — `src/routes/jobs/[id]/+page.svelte`

Thin wrapper delegating to the presentation component:

```svelte
<script lang="ts">
	import JobDetailPage from '$lib/pages/JobDetailPage.svelte';

	let { data } = $props();
</script>

<JobDetailPage job={data.job} />
```

### 3. Presentation component — `src/lib/pages/JobDetailPage.svelte`

Props: `{ job: JobResource }`.

Layout (matching existing app style):

- "Back to jobs" link at top (using `resolve('/jobs')` from `$app/paths`)
- `h1` with job name, status `Badge` inline
- Company name as subtitle
- Description paragraph
- External ID (small text)
- External URL as "Apply" link (if present) — use `Button` with `href`
- Skills section heading with count
- Skills rendered inline as a bordered list (similar to the job list card
  styling) — each item shows `label` (title), `text` (subtitle if different
  from label), and `ctid`. This will be extracted into `SkillItem` in Phase 2.

Use `Badge` for status with variant mapping:

- `active` → default
- `closed` → secondary
- `draft` → outline

Example skill rendering (inline, to be extracted later):

```svelte
<ul class="divide-y divide-border rounded-lg border border-border bg-card">
	{#each job.skills as skill (skill.url)}
		<li class="px-4 py-3">
			{#if skill.label && skill.text && skill.text !== skill.label}
				<div class="font-medium text-foreground">{skill.label}</div>
				<p class="mt-1 text-sm text-muted-foreground">{skill.text}</p>
			{:else}
				<div class="font-medium text-foreground">{skill.label ?? skill.text}</div>
			{/if}
			{#if skill.ctid}
				<p class="mt-1 text-xs text-muted-foreground">{skill.ctid}</p>
			{/if}
		</li>
	{/each}
</ul>
```

### 4. Storybook stories — `src/lib/pages/JobDetailPage.stories.svelte`

Create stories exercising different states:

- **Default** — job with several skills, `active` status, `externalUrl` present
- **No External URL** — `externalUrl` is `undefined`
- **Closed status** — `status: 'closed'`
- **Draft status** — `status: 'draft'`
- **Single Skill** — job with exactly one skill
- **Many Skills** — job with 15+ skills (scroll behavior)
- **Minimal Skill Data** — skills with `text` only, no `label`

Use mock data based on the `JobResource` type. Import from
`$lib/server/domain/job/job-resource.js` for the type.

### 5. Update job list — `src/routes/jobs/+page.svelte`

Change the job name `<div>` to an `<a>` link:

```svelte
<a href={resolve(`/jobs/${job.id}`)} class="font-medium text-foreground hover:underline">
	{job.name}
</a>
```

Import `resolve` from `$app/paths` (already used in this file for the create
button).

## Validate

```sh
pnpm turbo check
pnpm turbo test
```

Verify in the browser:

- `/jobs` list renders with clickable job titles
- Clicking a title navigates to `/jobs/[id]`
- Detail page shows all expected metadata and skills
- Navigating to a non-existent ID shows 404
