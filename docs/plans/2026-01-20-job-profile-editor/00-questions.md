# Questions

## Framework Selection

1. **Framework Selection UI**: ✅ **ANSWERED**: Searchable list - chosen for future scalability with search service integration.

2. **Framework Loading State**: ✅ **ANSWERED**: Show skeletons for both loading states (framework fetch, then skills fetch).

## Skill Selection

3. **Skill Display**: ✅ **ANSWERED**: Abbreviated view showing `ceasn:competencyLabel` if present, falling back to `ceasn:competencyText`. If both are present, show label prominently with text below in less emphasized font. Display with checkboxes for selection.

4. **Skill Selection Feedback**: ✅ **ANSWERED**: Two-column layout - left column shows all skills with checkboxes/selected status, right column shows selected skills (primary column for job). Includes count, filtering/searching capability. Designed to scale for multi-framework selection.

5. **Skill Selection Limits**: ✅ **ANSWERED**: No hard limits. Suggest 5-10 most important skills, show light warning if more than 10 selected.

## Job Profile Data Structure

6. **Job Profile Structure**: ✅ **ANSWERED**: Include job name, one-sentence description, company name, selected framework(s) as array, and selected skills objects (label, text, url).

7. **Job Profile Display**: ✅ **ANSWERED**: Show a success message after "saving" (no persistence yet).

## Configuration

8. **Framework Configuration**: ✅ **ANSWERED**: TypeScript config file (e.g., `src/lib/config/frameworks.ts`) for type safety and extensibility.

9. **Error Handling**: ✅ **ANSWERED**: Handle all error cases - failed framework fetches (show error, allow retry), failed skill fetches (show partial results), invalid JSON-LD (show error, prevent proceeding).

## UI/UX

10. **Navigation**: ✅ **ANSWERED**: No navigation for now.

11. **Responsive Design**: ✅ **ANSWERED**: Tested in Storybook at different breakpoints using container queries.

## Testing

12. **Storybook Stories**: ✅ **ANSWERED**: Create stories for all states and flows - framework selection, skills list, full flow, and different states (loading, error, empty, etc.).

13. **Mock Data**: ✅ **ANSWERED**: Use a service pattern with configuration that determines whether a real HTTP service or a Fake service is used.
