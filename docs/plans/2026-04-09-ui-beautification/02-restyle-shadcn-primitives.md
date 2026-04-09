# Phase 2: Restyle shadcn Primitives

## Scope

Update the shadcn UI components (Button, Card, Input, Badge) to match the Kinetic Professional
design philosophy: gradient primary button, `flame` variant, borderless cards, ghost-border
inputs, and flame/warmth badge variants.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- Component styling via `tailwind-variants` (`tv()`) and `cn()`.
- No raw hex — use semantic token classes (`bg-primary`, `bg-flame`, etc.).
- Container queries (`@md:`, etc.) over media queries.

## Implementation Details

### 1. Button — `src/lib/components/ui/button/button.svelte`

Update the `buttonVariants` `tv()` definition:

**Changes to existing variants:**

- `default`: Replace flat `bg-primary` with gradient:
  ```
  'bg-gradient-to-br from-primary to-primary-container text-primary-foreground hover:opacity-90 shadow-xs'
  ```
- `outline`: Update for ghost-border style:
  ```
  'bg-background hover:bg-accent hover:text-accent-foreground border border-border/15 shadow-xs dark:border-border/30'
  ```
- `secondary`: Use the surface token:
  ```
  'bg-secondary text-secondary-foreground hover:bg-accent shadow-xs'
  ```

**Add new `flame` variant:**

```
flame: 'bg-gradient-to-br from-flame to-[hsl(14,80%,40%)] text-flame-foreground hover:opacity-90 shadow-xs'
```

The flame gradient goes from bright `#ff5722` to a deeper warm red, matching the
"Review Match" button in the sidebar example (`from-secondary-container to-secondary`).

**Update `base` class:** Bump default rounding from `rounded-md` to `rounded-lg` to
match the new base radius.

### 2. Card — `src/lib/components/ui/card/card.svelte`

Replace the current card styling:

```
// Before:
'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm'

// After:
'flex flex-col gap-6 rounded-xl bg-card py-6 text-card-foreground shadow-ambient'
```

Key changes:

- Remove `border` — tonal layering only
- Replace `shadow-sm` with `shadow-ambient` (the 40px blur ambient shadow)

### 3. Input — `src/lib/components/ui/input/input.svelte`

Update the input styling for the "modern input" design:

```
// Before:
'flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 ...'

// After:
'flex h-9 w-full min-w-0 rounded-lg border border-input/15 bg-accent px-3 py-1 ...'
```

Key changes:

- `rounded-md` → `rounded-lg`
- `border border-input` → `border border-input/15` (ghost border)
- `bg-background` → `bg-accent` (surface-container-high fill)
- Focus state: `focus-visible:bg-background focus-visible:border-primary/50` (lighten bg, show primary ghost border)
- Apply to both the regular input and the file input variants.

### 4. Badge — `src/lib/components/ui/badge/badge.svelte`

Add `flame` and `warmth` variants to the `badgeVariants` `tv()`:

```ts
variants: {
  variant: {
    default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
    secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
    destructive: '...',  // keep as-is
    outline: '...',  // keep as-is
    flame: 'bg-flame text-flame-foreground [a&]:hover:bg-flame/90 border-transparent',
    'flame-subtle': 'bg-flame-subtle text-flame dark:text-flame-muted [a&]:hover:bg-flame-muted/30 border-transparent',
    warmth: 'bg-warmth text-warmth-subtle dark:text-[hsl(42,40%,18%)] [a&]:hover:bg-warmth/90 border-transparent',
    'warmth-subtle': 'bg-warmth-subtle text-warmth dark:text-warmth [a&]:hover:bg-warmth-subtle/80 border-transparent',
  }
}
```

Update the `BadgeVariant` type export so it includes the new options.

## Validate

```bash
pnpm turbo check
pnpm turbo test
```

Visually inspect existing stories for Button, Card, Badge in Storybook to confirm
the new styles render correctly in both light and dark modes.
