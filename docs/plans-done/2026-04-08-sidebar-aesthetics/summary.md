# Sidebar Aesthetics - Summary

## Overview

Improved the Create Job page layout and search UX with a desktop-only sidebar, merged search card, and integrated quick picks.

## Changes

### SkillSearch.svelte

- Added `picks` prop accepting `QuickPickItem[]`
- Quick picks rendered in the empty/resting state, filtered by current mode tab (skills, containers, frameworks)
- Skill-type picks toggle directly; container/framework picks enter drill-down view showing subsidiary skills for individual selection
- Quick picks reappear when query is cleared after a search

### CreateJobPage.svelte

- Breakpoint changed from `@lg` (512px) to `@5xl` (1024px) — sidebar only on desktop
- Sidebar widened from 340px to 400px, gap increased from 6 to 8
- Two separate cards (Quick Picks + Search) merged into one styled card with shadow and uppercase section header
- Standalone `QuickPicks` component and `handleToggleQuickPick` handler removed — picks now handled by SkillSearch
- Dialog content simplified to just SkillSearch with picks
- File reduced from 248 to 190 lines

### SelectedSkillsColumn.svelte

- Empty-state hint text breakpoints updated from `@lg` to `@5xl`

### ResponsivePreview (Storybook)

- Added `fluid` prop: fills available canvas space with guaranteed min-width
- Default banner shows `Preview (≥{width}px)` in fluid mode

### CreateJobPage.stories.svelte

- Desktop stories use `fluid` prop for breathing room
- Labels updated to reference `@5xl` breakpoint
