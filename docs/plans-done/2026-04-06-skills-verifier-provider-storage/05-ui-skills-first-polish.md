# Phase 5: UI skills-first polish

## Scope of phase

Align **copy, layout, and validation** with **skills-first** job creation: frameworks are **optional metadata**, not a gate. Tighten shared **client types** (`job-profile` etc.) so they do not imply “framework required.” Keep `**FrameworkClient`\*\* available for browsing skills if you still use it under the hood.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later.

## Implementation Details

**Primary UI**

- `[src/lib/pages/CreateJobPage.svelte](../../../src/lib/pages/CreateJobPage.svelte)`: headings, helper text, and validation messages should emphasize **required skills** and de-emphasize framework selection.
- `[src/lib/components/selected-skills-column/SelectedSkillsColumn.svelte](../../../src/lib/components/selected-skills-column/SelectedSkillsColumn.svelte)` / `[SkillsList.svelte](../../../src/lib/components/skills-list/SkillsList.svelte)`: adjust empty states (“Select a framework…” → skills-first wording) if framework is optional.
- `[FrameworkSelector.svelte](../../../src/lib/components/framework-selector/FrameworkSelector.svelte)`: treat as **optional** section (collapsible or below skills) or hide until “Add framework hint” is chosen — pick one consistent UX.

**Types**

- `[src/lib/types/job-profile.ts](../../../src/lib/types/job-profile.ts)`: mark `frameworks` optional on `JobProfile` if still used; document that server may persist `[]`.

**Storybook**

- Update stories that assume framework-first flow (`[CreateJobPage.stories.svelte](../../../src/lib/pages/CreateJobPage.stories.svelte)`, `[FrameworkSelector.stories.svelte](../../../src/lib/components/framework-selector/FrameworkSelector.stories.svelte)`) so they match the new narrative.

**Accessibility**

- Preserve labels and `sr-only` text when reordering sections.

## Validate

```bash
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
pnpm run build:storybook
```

Optional visual pass: `pnpm storybook` on key stories.
