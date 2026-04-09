# UI Beautification — "The Kinetic Professional" Theme

## Scope of Work

Implement the "Kinetic Professional" design system across the Skills Verifier app. This involves:

1. **New color palette** — Replace the current shadcn zinc palette with a deep-purple primary ("Job Role Layer") and flame/heat secondary/tertiary tokens. Both light and dark mode.
2. **Surface & depth model** — Adopt "tonal layering" (background-color shifts for depth) over border-based separation. Ambient shadows only where needed.
3. **Typography refinements** — Editorial treatment of Inter: tightened tracking on display/headline sizes, generous line-height on body.
4. **Component style updates** — Restyle shadcn primitives (Button, Card, Input, Badge, etc.) and domain components (QuickPickItem, SkillSearch, AppHeader, etc.) to match the design philosophy.
5. **Layout refinements** — Increase spacing, apply surface hierarchy to sections, refine the header with glassmorphism.
6. **Design-token groundwork for User Skill Layer** — Define the secondary/tertiary flame tokens in CSS so future "achievement/skill" components can use them, even though those components don't exist yet.

## Current State

### Tech stack

- **SvelteKit + Svelte 5**, **Tailwind CSS v4** (CSS-configured, no JS config), **shadcn-svelte** components in `src/lib/components/ui/`, **bits-ui** headless primitives, **tailwind-variants**, **clsx + tailwind-merge**.

### Theme system

- Single file: `src/routes/layout.css` — `:root` / `.dark` CSS variables mapped to Tailwind via `@theme inline`.
- Current palette: **shadcn zinc** — neutral grays, no brand color applied.
- Dark mode: class-based (`.dark` on `<html>`), toggled via `ThemeToggle` and persisted to `localStorage`.

### Components

- **shadcn UI primitives** (`ui/`): alert, badge, button, card, checkbox, input, label, radio-group, skeleton, textarea.
- **Domain components**: AppHeader, ThemeToggle, JobProfileForm, SelectedSkillsColumn, SkillSearch, SkillSearchResultItem, QuickPicks/QuickPickItem, EntityResultItem, CtdlSkillContainerView/CtdlEntityHeader, SkillItem.
- Some domain components use **hardcoded Tailwind colors** (e.g. `QuickPickItem` uses `bg-blue-100`, `bg-purple-100`, etc.) instead of semantic tokens.

### Layout

- Single root `+layout.svelte`: sticky header with backdrop-blur, `<main>` with `@container`, `max-w-7xl`, `px-4 py-8`.
- Pages: home (redirects to `/jobs`), job list, create job (split layout with search panel), job detail.
- Components use `border border-border` for separation. Cards have `shadow-sm`.

### What doesn't exist yet

- No "User Skill Layer" components (achievements, skill meters, proficiency indicators).
- No gradient buttons or glassmorphic floating elements beyond the header.
- No explicit typography scale configuration (just default Tailwind sizes).

## Style conventions (for this plan)

- **Svelte components**: PascalCase filenames, `$props()` / `$state()` / `$derived()` runes.
- **File organization**: domain-first, one concept per file, ~200-line limit.
- **CSS/Tailwind**: all theme tokens in `layout.css` via CSS variables + `@theme inline`. Components use semantic token classes (`bg-primary`, `text-muted-foreground`, etc.) not raw colors.
- **Component styling**: `tailwind-variants` (`tv()`) for variant APIs; `cn()` for merging.
- **Container queries**: `@md:`, `@lg:`, etc. over media queries.
- **Testing**: Storybook stories for visual components; run from `apps/storybook` if in monorepo context.

---

## Questions

### Q1: Color token mapping strategy

**Context:** The design document references Material 3-style tokens (`primary`, `primary_container`, `secondary_container`, `tertiary_fixed`, `surface_container_low`, `on_surface_variant`, etc.). Our shadcn system uses a flatter token set: `primary`, `secondary`, `muted`, `accent`, `card`, `background`, `destructive`.

**Suggested approach:** Map the design concepts onto the shadcn token structure rather than introducing a parallel M3 token system. This keeps compatibility with existing shadcn components:

| Design concept        | shadcn token                                                                 | Light value                      | Purpose                                  |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| Deep Purple (primary) | `--primary`                                                                  | `#3211cd` (hsl ~249 85% 44%)     | Buttons, links, active states            |
| Primary container     | `--primary-foreground` stays white; add `--primary-container` as a new token | `#4c3ae3`                        | Gradient endpoint, highlighted sections  |
| Flame (secondary)     | `--secondary`                                                                | warm/muted complement            | Secondary buttons, subtle highlights     |
| Flame intense         | `--accent`                                                                   | `#ff5722` (hsl ~14 100% 57%)     | Skill chips, user-data highlights        |
| Warm gold             | Add `--accent-warm` or use chart tokens                                      | `#ffdf9e`                        | Low-intensity flame, tertiary highlights |
| Surface stack         | `--background`, `--card`, `--muted`                                          | Purple-tinted whites/near-whites | Tonal layering                           |
| on_surface_variant    | `--muted-foreground`                                                         | `#474555`                        | De-emphasized text                       |

We'd also add a few custom tokens (`--primary-container`, `--accent-warm`) outside the standard shadcn set for design-specific needs. These can live in `layout.css` and be wired via `@theme inline`.

**Question:** Does this mapping approach work for you? Do you want the flame accent (`#ff5722`) reserved exclusively for future user-skill components, or should it appear now (e.g. in a "featured" badge variant)?

### Q2: Dark mode palette derivation

**Context:** The design document provides light-mode hex values only. We need dark-mode equivalents for every token. The current approach uses `:root` / `.dark` pairs in `layout.css`.

**Suggested approach:** Derive dark-mode values by:

- Keeping hue consistent with light-mode counterparts.
- Shifting lightness: backgrounds go very dark (L ~5-12%), surfaces become dark purple-tinted grays, foreground text goes near-white.
- Primary in dark mode stays vibrant but may lighten slightly for contrast (e.g. `#7c6bf0`).
- Flame accent stays bold in dark mode (orange/warm colors read well on dark backgrounds).
- Use WCAG AA contrast ratios as the constraint.

**Question:** Are you comfortable with me deriving the dark palette using these principles, or do you have specific dark-mode hex values or reference material in mind?

### Q3: Border elimination scope

**Context:** The design says "No-Line Rule" — no `1px solid` borders; boundaries via background-color shifts only. Currently, many components use borders: `AppHeader` (`border-b border-border`), `Card` (`border bg-card`), `Input` (`border border-input`), `QuickPickItem` (`border`), dialog overlays, etc.

**Suggested approach:** Take a pragmatic path:

- **Remove borders** from cards, section separators, and list items — replace with tonal surface shifts.
- **Keep subtle borders** on interactive inputs (text fields, search bars) for usability — but restyle them as "ghost borders" (very low opacity, e.g. `border-border/15`) per the design doc's accessibility fallback.
- **Keep the header bottom edge** but soften it to a gradient fade or very subtle tonal shift rather than a hard border.
- **Modals/dialogs** keep a faint ghost border for floating context.

**Question:** Does this pragmatic approach work, or do you want to go fully borderless and rely entirely on surface shifts even for inputs?

### Q4: Typography and font loading

**Context:** The design says "use Inter exclusively" with editorial tracking variations. The app currently uses Tailwind's default font stack (system fonts), which includes Inter on many systems. The design doc specifies specific sizes like `display-lg` (3.5rem) and tracking tightening (-0.02em).

**Suggested approach:**

- Explicitly load **Inter** from Google Fonts (variable weight) so it's guaranteed on all platforms.
- Define a set of utility classes or Tailwind `@theme` font-size tokens for the editorial scale (`display-lg`, `headline-md`, `title-lg`, `body-md`, `label-md`) with the specified tracking and line-height.
- Apply these in components rather than ad-hoc `text-2xl font-bold`.

**Question:** Should we load Inter from Google Fonts, or is the system-font fallback acceptable? Also, do you want the editorial type scale defined as custom Tailwind tokens (e.g. `text-display-lg`) or just documented utility class combos?

### Q5: Gradient buttons and glassmorphism scope

**Context:** The design calls for gradient-fill primary buttons (`primary` → `primary_container` at 135°) and glassmorphic floating elements. The current button is flat `bg-primary`.

**Suggested approach:**

- Update the **default button variant** to use a subtle linear gradient instead of flat fill.
- The **AppHeader** already has `backdrop-blur` — refine it with the design's semi-transparent surface tokens.
- Don't add glassmorphism to many elements yet — reserve it for the header and future floating nav. Keep it understated.

**Question:** Should the primary button gradient be the default for all primary buttons, or only for "hero" CTA buttons (with a separate variant like `variant="cta"`)?

### Q6: Radius tokens

**Context:** The design specifies `lg` (0.5rem) and `xl` (0.75rem) roundedness, and says "Don't use 90-degree corners." Current `--radius` is `0.5rem` with derived `sm/md/lg/xl` variants. Cards use `rounded-xl`, buttons use `rounded-md`.

**Suggested approach:** Bump the base `--radius` to `0.75rem` so that `rounded-lg` = 0.75rem and components naturally get more generous rounding. Cards, inputs, and chips would all feel rounder without per-component overrides.

**Question:** Does bumping the base radius to `0.75rem` feel right, or would you prefer to keep `0.5rem` and selectively apply `rounded-xl` where the design calls for it?

### Q7: Scope — Job Role Layer only, or stub User Skill Layer tokens?

**Context:** You mentioned that the "User Skill Layer" (achievements, skills flame meter, proficiency indicators) doesn't exist yet. The design doc defines flame/heat colors for these future components.

**Suggested approach:**

- **Define the flame tokens** (`--accent`, `--accent-warm`) in `layout.css` now so they're available.
- **Don't build** Skill Flame Meter, Contextual Secondary Nav, or other specialized components in this plan.
- **Do apply** the flame accent lightly where it makes sense today — e.g. the QuickPickItem type badges could use semantic tokens that map to flame colors, so when those future components arrive, the palette is already in place.

**Question:** Does this sound right — define tokens, apply lightly to existing "skill-adjacent" UI, but don't build the specialized components?

---

### Q8: Flame-exercising component for Storybook

**Context:** User wants a component that exercises the flame/warm palette, built as a Storybook story (no route yet), to validate the color tokens in practice.

**Suggested component:** A **SkillProficiencyCard** — inspired by the match detail page's skill cards. It naturally uses:

- Primary (skill title)
- Flame (`--flame` / `--flame-muted`) for "Expert" proficiency level and high-heat indicator
- Warmth (`--warmth` / `--warmth-subtle`) for "Proficient" level and medium-heat
- Surface hierarchy (card on surface-container-low on background)
- The heat-intensity gradient bar (tertiary → flame gradient)

This exercises the full flame palette and demonstrates tonal layering in one compact component.

**Question:** Is a SkillProficiencyCard the right component to build, or would you prefer something different?

### Q9: Color Palette Documentation Story

**Context:** User wants a Storybook story page that documents the full color palette system — token names, swatches, light/dark mode, and the conceptual layering (Job Role vs User Skill).

**Suggested approach:** Create `src/lib/components/ui/color-palette/ColorPalette.stories.svelte` as a documentation story with organized swatch groups.

**Question:** (No question — this is confirmed scope.)

---

## Answers

### A1: Color token mapping strategy

**Decision:** Map to shadcn tokens. Add a small set of custom tokens for flame/warmth.

**Sub-question answer:** Use flame colors now — build a Storybook-only component (SkillProficiencyCard) that exercises the flame palette. Also create a palette documentation story.

**Additional scope from examples:**

From the two example HTML files, the concrete palette is:

**Job Role Layer (Primary — deep purple):**

- `primary`: `#3211cd`
- `primary-container`: `#4c3ae3` (gradient endpoint)
- `primary-fixed`: `#e3dfff` (light purple tint for badges/backgrounds)

**User Skill Layer (Flame — warm orange/red):**

- `flame`: `#ff5722` (intense flame — expert, high-heat)
- `flame-foreground`: `#ffffff`
- `flame-muted`: `#ffb5a0` (medium warmth, secondary-fixed-dim)
- `flame-subtle`: `#ffdbd1` (soft peach, secondary-fixed)

**Warmth Layer (Gold/Tertiary):**

- `warmth`: `#fabd00` (bright gold — proficient, medium-heat)
- `warmth-subtle`: `#ffdf9e` (soft gold background)

**Surfaces (purple-tinted):**

- `background`: `#fcf8ff`
- `surface-container-low` / `secondary`: `#f6f2ff`
- `surface-container` / `muted`: `#f0ecfa`
- `surface-container-high` / `accent`: `#eae6f4`
- `card` / `surface-container-lowest`: `#ffffff`
- `on-surface` / `foreground`: `#1b1b24`
- `on-surface-variant` / `muted-foreground`: `#474555`
- `outline-variant` / `border`: `#c8c4d8`

These will all need dark-mode counterparts (see A2).

### A2: Dark mode palette derivation

**Decision:** Derive dark-mode values by keeping hue consistent and inverting lightness. Backgrounds become very dark purple-black, foregrounds go near-white with purple tint. Primary lightens to ~`#c4c0ff` (inverse-primary). Flame and warmth colors stay bold — warm tones pop on dark backgrounds. All pairings validated against WCAG AA.

## Notes

- **Preferred example reference:** `00-example-match-detail-page-r-sidebar.html` is the best
  reference for the match/flame UI. It uses a right sidebar for credentials, a flame-gradient
  primary CTA ("Review Match"), and a cleaner two-column skill card grid. Prefer this over
  the original `00-example-match-detail-page.html` when referencing the flame/warmth layer.
- The flame gradient button in the sidebar example uses `from-secondary-container to-secondary`
  (i.e. `#ff5722` → `#b02f00`), confirming the `flame` variant gradient direction.

### A7: Scope — tokens and components

**Decision:** Define all flame/warmth tokens now (light + dark). Build two Storybook-only components to exercise them:

1. **SkillProficiencyCard** — exercises primary, flame, warmth, and surface tokens
2. **SkillFlameMeter** — the horizontal heat-intensity bar from the design doc (gradient from warmth → flame)

Also: replace hardcoded colors in existing components (e.g. QuickPickItem) with semantic tokens. Don't build the Contextual Secondary Nav or credential tray — those are future feature work.

### A6: Radius tokens

**Decision:** Bump base `--radius` to `0.75rem`. This gives `sm: 0.375rem`, `md: 0.5rem`, `lg: 0.75rem`, `xl: 1rem`. Everything gets rounder automatically.

### A5: Gradient buttons and variant naming

**Decision:** Gradient is the default for primary buttons. The variant system needs to handle both conceptual layers (Job Role vs User Skill) plus a neutral base.

**Button variant system:**

| Variant       | Style                                                   | Layer        | Use case                                |
| ------------- | ------------------------------------------------------- | ------------ | --------------------------------------- |
| `default`     | Purple gradient (`primary` → `primary-container`, 135°) | Job Role     | Main CTAs in job context                |
| `flame`       | Flame gradient (`flame` → warm orange-red, 135°)        | User Skill   | CTAs for user skill/achievement actions |
| `secondary`   | Light surface bg, subtle                                | Base/Neutral | De-emphasized actions (both layers)     |
| `outline`     | Ghost border + transparent bg                           | Base/Neutral | Alternative to secondary                |
| `ghost`       | No background, text only                                | Base/Neutral | Minimal inline actions                  |
| `destructive` | Red                                                     | Base         | Delete/error                            |
| `link`        | Underline text                                          | Base         | Inline links                            |

The naming is intentionally flat — `default` and `flame` map to the two layers, everything else is neutral. If we later need a `warmth` variant (gold, for medium-intensity user actions), it slots in cleanly. Badge and chip variants should follow the same naming pattern where applicable.

### A4: Typography and font loading

**Decision:** Load Inter from Google Fonts (variable weight) via `app.html`. Define a custom editorial type scale as Tailwind `@theme` tokens in `layout.css` — `display-lg`, `headline-md`, `title-lg`, `body-md`, `label-md` with associated tracking and line-height. Override the default font-family to `'Inter', ui-sans-serif, system-ui, sans-serif`.

### A3: Border elimination scope

**Decision:** Pragmatic approach. Remove borders from cards, section separators, and list items — replace with tonal surface shifts. Ghost borders (`border/15` opacity) on inputs and floating elements (dialogs, popovers). Header drops hard border in favor of glass effect alone or ghost border. Chips use background shifts instead of outlines. Intentional accent bars (like `border-l-4 border-primary`) are fine — they're decorative, not structural.

### A8: Flame-exercising component

**Decision:** Build a **SkillProficiencyCard** as a Storybook-only component. Exercises primary, flame, warmth, and surface tokens. Inspired by the match detail page skill cards.

### A9: Color Palette Documentation Story

**Decision:** Confirmed — create a story page documenting all tokens with swatches, organized by conceptual layer.
