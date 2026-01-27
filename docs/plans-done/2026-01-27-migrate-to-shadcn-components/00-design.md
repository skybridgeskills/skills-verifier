# Migrate to shadcn-svelte Components Design

## Scope of Work

Update existing UI components and pages to use shadcn-svelte components idiomatically:

- Add missing shadcn components: Textarea, Alert, Checkbox, Skeleton
- Replace custom Card component with shadcn Card
- Update JobProfileForm to use shadcn Input, Label, Button, Textarea
- Update FrameworkSelector to use shadcn Input, Button, Skeleton
- Update SkillsList to use shadcn Input, Skeleton
- Update SelectedSkillsColumn to use shadcn Button, Card
- Update SkillItem to use shadcn Checkbox
- Update CreateJobPage to use shadcn Alert for messages
- Update Card.stories.svelte to use shadcn Card
- Remove old Card component
- Ensure all components work with dark mode

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── card/                          # REMOVE: Old Card component
│   │   │   ├── Card.svelte                # DELETE
│   │   │   └── Card.stories.svelte        # UPDATE: Use shadcn Card
│   │   ├── framework-selector/
│   │   │   └── FrameworkSelector.svelte   # UPDATE: Use Input, Button, Skeleton
│   │   ├── job-profile-form/
│   │   │   └── JobProfileForm.svelte      # UPDATE: Use Input, Label, Button, Textarea
│   │   ├── selected-skills-column/
│   │   │   └── SelectedSkillsColumn.svelte # UPDATE: Use Button, Card
│   │   ├── skill-item/
│   │   │   └── SkillItem.svelte           # UPDATE: Use Checkbox
│   │   ├── skills-list/
│   │   │   └── SkillsList.svelte          # UPDATE: Use Input, Skeleton
│   │   └── ui/                            # NEW: Additional shadcn components
│   │       ├── alert/                     # NEW: Alert component
│   │       ├── checkbox/                  # NEW: Checkbox component
│   │       ├── skeleton/                  # NEW: Skeleton component
│   │       └── textarea/                  # NEW: Textarea component
│   └── pages/
│       └── CreateJobPage.svelte           # UPDATE: Use Alert for messages
```

## Conceptual Architecture

### Component Migration Flow

```
┌─────────────────────────────────────────────────────────┐
│              Current Custom Components                    │
│  (Native HTML + Custom Tailwind Classes)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          │ migrate to
                          ▼
┌─────────────────────────────────────────────────────────┐
│              shadcn-svelte Components                     │
│  (Styled, Accessible, Theme-Aware Components)            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Theme System                          │
│  - CSS Variables (light/dark)                           │
│  - Consistent styling                                    │
│  - Dark mode support                                     │
└─────────────────────────────────────────────────────────┘
```

### Component Mapping

```
Old Component/Element          →  New shadcn Component
─────────────────────────────────────────────────────────
<Card>                         →  <Card> + <CardContent>
<input type="text">            →  <Input>
<input type="textarea">        →  <Textarea>
<label>                        →  <Label>
<button>                       →  <Button> (with variants)
<input type="checkbox">        →  <Checkbox>
Custom success/error divs      →  <Alert> (with variants)
Custom loading skeletons       →  <Skeleton>
Custom empty states            →  <Card> + content
```

## Main Components and Interactions

### 1. JobProfileForm Migration

**Current**: Uses native `<input>`, `<textarea>`, `<label>`, `<button>` with custom classes

**New**:

- `<Input>` for name and company fields
- `<Textarea>` for description field
- `<Label>` for all labels
- `<Button>` for submit button (variant: "default")
- Error messages can use `<Alert>` variant="destructive" or keep inline text

**Benefits**: Consistent styling, better accessibility, theme support

### 2. FrameworkSelector Migration

**Current**: Native `<input>` for search, native `<button>` for selection

**New**:

- `<Input>` for search field
- `<Button>` for framework selection (variant: "outline" or "ghost")
- `<Skeleton>` for loading states
- `<Alert>` for error states (variant: "destructive")

**Benefits**: Consistent loading states, better error presentation

### 3. SkillsList Migration

**Current**: Native `<input>` for search, custom loading skeletons

**New**:

- `<Input>` for search field
- `<Skeleton>` for loading states (both framework and skills loading)
- `<Alert>` for error states (variant: "destructive")
- Keep SkillItem component (which will use Checkbox)

**Benefits**: Consistent loading indicators, better UX

### 4. SelectedSkillsColumn Migration

**Current**: Native `<button>` for remove actions, custom empty state

**New**:

- `<Button>` for remove actions (variant: "ghost", size: "icon")
- `<Card>` + `<CardContent>` for empty state (more idiomatic)
- `<Alert>` for warning message (variant: "warning" if available, or "default" with yellow styling)

**Benefits**: Consistent button styling, better empty state presentation

### 5. SkillItem Migration

**Current**: Native `<input type="checkbox">` with custom styling

**New**:

- `<Checkbox>` component
- Keep the label wrapper structure but use shadcn Checkbox

**Benefits**: Consistent checkbox styling, better accessibility

### 6. CreateJobPage Migration

**Current**: Custom success/error message divs with inline SVG icons

**New**:

- `<Alert>` for success messages (variant: "default" or custom success styling)
- `<Alert>` for error messages (variant: "destructive")
- Keep page structure but ensure all text colors use theme variables

**Benefits**: Consistent messaging, better accessibility, theme support

### 7. Card Component Replacement

**Current**: Simple custom Card component only used in stories

**New**:

- Use shadcn `<Card>` + `<CardContent>` (or other sub-components as needed)
- Update Card.stories.svelte to demonstrate shadcn Card usage
- Remove old Card component

**Benefits**: More flexible, better structure, consistent with rest of app

## Theme Integration

All components will automatically support dark mode through:

- CSS variables defined in `layout.css`
- shadcn components use theme variables by default
- Custom classes should use theme variables (e.g., `text-foreground` instead of `text-gray-900`)

## Accessibility Improvements

- Better keyboard navigation with shadcn components
- Proper ARIA attributes built into components
- Focus management handled by components
- Screen reader support improved

## Migration Strategy

1. Add new shadcn components first (Textarea, Alert, Checkbox, Skeleton)
2. Update components one at a time, starting with simpler ones
3. Test each component after migration
4. Update Storybook stories as we go
5. Remove old Card component last
6. Ensure all components work in both light and dark modes
