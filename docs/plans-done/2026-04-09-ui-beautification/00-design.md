# UI Beautification — "The Kinetic Professional" Theme

## Scope of Work

Implement the "Kinetic Professional" design system across the Skills Verifier app:

1. Replace the shadcn zinc palette with a deep-purple primary + flame/warmth accent system (light + dark)
2. Adopt tonal surface layering over border-based separation
3. Add editorial typography scale via Inter from Google Fonts
4. Restyle shadcn primitives and domain components to match the design philosophy
5. Build new Storybook-only components (SkillProficiencyCard, SkillFlameMeter, ColorPalette docs)
6. Define flame/warmth tokens for future User Skill Layer components

## File Structure

```
src/
├── routes/
│   ├── layout.css                          # UPDATE: Full palette, type scale, flame/warmth tokens
│   └── +layout.svelte                      # UPDATE: Glass header refinement
├── app.html                                # UPDATE: Google Fonts Inter link
└── lib/
    ├── components/
    │   ├── app-header/
    │   │   └── AppHeader.svelte            # UPDATE: Glass effect, remove hard border
    │   ├── quick-picks/
    │   │   └── QuickPickItem.svelte        # UPDATE: Semantic tokens
    │   ├── skill-search/
    │   │   └── SkillSearch.svelte          # UPDATE: Surface hierarchy, input styling
    │   ├── selected-skills-column/
    │   │   └── SelectedSkillsColumn.svelte # UPDATE: Tonal layering
    │   ├── skill-item/
    │   │   └── SkillItem.svelte            # UPDATE: Surface shifts, typography
    │   ├── entity-result-item/
    │   │   └── EntityResultItem.svelte     # UPDATE: Tonal card styling
    │   ├── ctdl-skill-container-view/
    │   │   ├── CtdlSkillContainerView.svelte # UPDATE: Surface hierarchy
    │   │   └── CtdlEntityHeader.svelte     # UPDATE: Typography
    │   ├── skill-flame-meter/
    │   │   ├── SkillFlameMeter.svelte      # NEW: Heat intensity bar
    │   │   ├── SkillFlameMeter.stories.svelte # NEW
    │   │   └── index.ts                    # NEW
    │   ├── skill-proficiency-card/
    │   │   ├── SkillProficiencyCard.svelte # NEW: Skill card with proficiency + flame
    │   │   ├── SkillProficiencyCard.stories.svelte # NEW
    │   │   └── index.ts                    # NEW
    │   └── ui/
    │       ├── button/
    │       │   └── button.svelte           # UPDATE: Gradient default, 'flame' variant
    │       ├── card/
    │       │   └── card.svelte             # UPDATE: Remove border, ambient shadow
    │       ├── input/
    │       │   └── input.svelte            # UPDATE: Ghost border, surface-high bg
    │       ├── badge/
    │       │   └── badge.svelte            # UPDATE: 'flame'/'warmth' variants
    │       └── color-palette/
    │           ├── ColorPalette.svelte      # NEW: Palette documentation
    │           ├── ColorPalette.stories.svelte # NEW
    │           └── index.ts                # NEW
    └── pages/
        ├── CreateJobPage.svelte            # UPDATE: Surface hierarchy, spacing
        └── JobDetailPage.svelte            # UPDATE: Typography, tonal styling
```

## Reference Examples

These examples may not be a perfect match to our architecture or have the exact right copy, but they
may be useful to refer to for how colors work together, examples of specific components. They're pretty.

- **Job Role Layer:** `00-example-job-detail-page.html` — purple primary, tonal cards, skill list
- **User Skill Layer (preferred):** `00-example-match-detail-page-r-sidebar.html` — flame gradient
  CTA, proficiency cards with heat bars, credential sidebar, two-column grid
- **User Skill Layer (original):** `00-example-match-detail-page.html` — similar but with bottom
  tray instead of sidebar

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────┐
│                   layout.css                         │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  :root (light)│ │ .dark        │ │ @theme      │ │
│  │               │ │              │ │  inline     │ │
│  │  Surfaces     │ │  Surfaces    │ │             │ │
│  │  Primary      │ │  Primary     │ │  --color-*  │ │
│  │  Flame/Warmth │ │  Flame/Warmth│ │  --radius-* │ │
│  │  Typography   │ │  Typography  │ │  --font-*   │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ CSS variables
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────────┐
  │ shadcn   │   │ Domain   │   │ New Flame    │
  │ ui/*     │   │ comps    │   │ components   │
  │          │   │          │   │              │
  │ button   │   │ AppHeader│   │ SkillFlame   │
  │  +flame  │   │ QuickPick│   │  Meter       │
  │ card     │   │ SkillItem│   │ SkillProf    │
  │ input    │   │ etc.     │   │  Card        │
  │ badge    │   │          │   │ ColorPalette │
  │  +flame  │   │          │   │  (docs)      │
  └──────────┘   └──────────┘   └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
              Tailwind utility classes
              bg-primary, bg-flame,
              text-muted-foreground, etc.
```

## Color Token System

### Mapping to shadcn tokens

Standard shadcn tokens are remapped to the Kinetic Professional palette.
Custom tokens (`flame`, `flame-muted`, `flame-subtle`, `warmth`, `warmth-subtle`,
`primary-container`, `primary-fixed`) extend the set for layer-specific needs.

### Light palette

| Token                      | Value     | Purpose                                  |
| -------------------------- | --------- | ---------------------------------------- |
| `--background`             | `#fcf8ff` | Base surface (purple-tinted white)       |
| `--foreground`             | `#1b1b24` | Primary text                             |
| `--card`                   | `#ffffff` | Card surface (surface-container-lowest)  |
| `--card-foreground`        | `#1b1b24` | Card text                                |
| `--popover`                | `#ffffff` | Popover surface                          |
| `--popover-foreground`     | `#1b1b24` | Popover text                             |
| `--primary`                | `#3211cd` | Deep purple — Job Role Layer             |
| `--primary-foreground`     | `#ffffff` | Text on primary                          |
| `--primary-container`      | `#4c3ae3` | Gradient endpoint, highlighted areas     |
| `--primary-fixed`          | `#e3dfff` | Light purple tint for badges             |
| `--secondary`              | `#f6f2ff` | Surface-container-low (subtle secondary) |
| `--secondary-foreground`   | `#1b1b24` | Text on secondary                        |
| `--muted`                  | `#f0ecfa` | Surface-container                        |
| `--muted-foreground`       | `#474555` | De-emphasized text                       |
| `--accent`                 | `#eae6f4` | Surface-container-high (hover states)    |
| `--accent-foreground`      | `#1b1b24` | Text on accent                           |
| `--destructive`            | `#ba1a1a` | Error                                    |
| `--destructive-foreground` | `#ffffff` | Text on destructive                      |
| `--border`                 | `#c8c4d8` | Outline-variant                          |
| `--input`                  | `#c8c4d8` | Input border                             |
| `--ring`                   | `#3211cd` | Focus ring                               |
| `--flame`                  | `#ff5722` | Intense flame — User Skill Layer         |
| `--flame-foreground`       | `#ffffff` | Text on flame                            |
| `--flame-muted`            | `#ffb5a0` | Medium warmth                            |
| `--flame-subtle`           | `#ffdbd1` | Soft peach background                    |
| `--warmth`                 | `#fabd00` | Bright gold — proficient, medium heat    |
| `--warmth-subtle`          | `#ffdf9e` | Soft gold background                     |

### Dark palette (derived)

Principles: hue consistent, lightness inverted, flame/warmth stay bold.

| Token                    | Value               | Rationale                      |
| ------------------------ | ------------------- | ------------------------------ |
| `--background`           | ~`hsl(260 30% 6%)`  | Very dark purple-black         |
| `--foreground`           | ~`#f3effd`          | Near-white with purple tint    |
| `--card`                 | ~`hsl(260 20% 10%)` | One step up from background    |
| `--card-foreground`      | ~`#f3effd`          |                                |
| `--primary`              | ~`#c4c0ff`          | Lightened for dark-bg contrast |
| `--primary-foreground`   | ~`#1b1b24`          | Dark text on light primary     |
| `--primary-container`    | ~`#7c6bf0`          | Brighter than light-mode       |
| `--primary-fixed`        | ~`hsl(249 30% 20%)` | Darkened tint                  |
| `--secondary`            | ~`hsl(260 15% 15%)` | Dark purple surface            |
| `--secondary-foreground` | ~`#f3effd`          |                                |
| `--muted`                | ~`hsl(260 12% 18%)` | Slightly lighter dark surface  |
| `--muted-foreground`     | ~`hsl(260 10% 65%)` | Readable but de-emphasized     |
| `--accent`               | ~`hsl(260 15% 20%)` | Hover surface                  |
| `--accent-foreground`    | ~`#f3effd`          |                                |
| `--border`               | ~`hsl(260 10% 20%)` | Subtle dark purple             |
| `--input`                | ~`hsl(260 10% 20%)` |                                |
| `--ring`                 | ~`#c4c0ff`          |                                |
| `--flame`                | `#ff5722`           | Stays bold on dark             |
| `--flame-foreground`     | `#ffffff`           |                                |
| `--flame-muted`          | `#ffb5a0`           | Stays warm                     |
| `--flame-subtle`         | ~`hsl(14 40% 18%)`  | Darkened peach                 |
| `--warmth`               | `#fabd00`           | Stays bold                     |
| `--warmth-subtle`        | ~`hsl(42 40% 18%)`  | Darkened gold                  |

Exact HSL values will be finalized during implementation with WCAG AA contrast checks.

## Button Variant System

| Variant       | Style                                                   | Layer      | Use case                 |
| ------------- | ------------------------------------------------------- | ---------- | ------------------------ |
| `default`     | Purple gradient (`primary` → `primary-container`, 135°) | Job Role   | Main CTAs                |
| `flame`       | Flame gradient (warm orange-red, 135°)                  | User Skill | Skill/achievement CTAs   |
| `secondary`   | Surface bg, subtle                                      | Neutral    | De-emphasized actions    |
| `outline`     | Ghost border + transparent bg                           | Neutral    | Alternative to secondary |
| `ghost`       | No background                                           | Neutral    | Minimal actions          |
| `destructive` | Red                                                     | Neutral    | Delete/error             |
| `link`        | Underline text                                          | Neutral    | Inline links             |

Badge follows same pattern: adds `flame` and `warmth` variants.

## Typography Scale

Load Inter from Google Fonts (variable weight). Define editorial tokens:

| Token         | Size     | Tracking | Line-height | Use              |
| ------------- | -------- | -------- | ----------- | ---------------- |
| `display-lg`  | 3.5rem   | -0.02em  | 1.1         | Hero headings    |
| `headline-md` | 1.75rem  | -0.01em  | 1.3         | Section titles   |
| `title-lg`    | 1.25rem  | normal   | 1.4         | Card/item titles |
| `body-md`     | 0.875rem | normal   | 1.5         | Body text        |
| `label-md`    | 0.75rem  | 0.05em   | 1.4         | Metadata, tags   |

## Border Strategy

- **Cards, sections, list items**: No border — tonal surface shifts only
- **Inputs**: Ghost border (`border/15` opacity) + `surface-container-high` bg; on focus: 2px `primary` ghost
- **Header**: Glass effect (`backdrop-blur`), no hard border or ghost only
- **Dialogs/popovers**: Faint ghost border for floating context
- **Chips (QuickPickItem)**: Background shifts, no outline
- **Intentional accent bars**: `border-l-4 border-primary` is fine (decorative, not structural)

## Radius

Base `--radius`: `0.75rem` → `sm: 0.375rem`, `md: 0.5rem`, `lg: 0.75rem`, `xl: 1rem`.

## Style conventions

- **Svelte components**: PascalCase files, `$props()` / `$state()` / `$derived()` runes.
- **File organization**: domain-first, one concept per file, ~200-line limit.
- **CSS/Tailwind**: all tokens in `layout.css` via CSS variables + `@theme inline`. Components use semantic classes only.
- **Component styling**: `tailwind-variants` (`tv()`) for variant APIs; `cn()` for merging.
- **Container queries**: `@md:`, `@lg:`, etc. over media queries.
- **Import order**: externals → `$lib/` → relative, with blank lines between groups.
- **TSDoc**: for new public component APIs.
- **No raw hex in components**: always use token classes.
