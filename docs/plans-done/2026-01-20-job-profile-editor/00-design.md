# Design Overview

## File Structure

```
skills-verifier/
├── .env                                          # NEW: Environment configuration (service selection)
├── .env.example                                  # NEW: Example env file
└── src/
    ├── lib/
    │   ├── config/
    │   │   └── frameworks.ts                    # NEW: Framework configuration with predefined list
    │   ├── services/
    │   │   ├── framework-service.ts             # NEW: Service interface and real implementation
    │   │   └── framework-service-fake.ts         # NEW: Fake service for Storybook/testing
    │   ├── types/
    │   │   └── job-profile.ts                   # NEW: TypeScript types for frameworks, skills, job profiles
    │   ├── components/
    │   │   ├── FrameworkSelector.svelte         # NEW: Searchable framework selection component
    │   │   ├── FrameworkSelector.stories.svelte # NEW: Stories for framework selector
    │   │   ├── SkillsList.svelte                # NEW: Left column - all skills with checkboxes
    │   │   ├── SkillsList.stories.svelte        # NEW: Stories for skills list
    │   │   ├── SelectedSkillsColumn.svelte      # NEW: Right column - selected skills for job
    │   │   ├── SelectedSkillsColumn.stories.svelte # NEW: Stories for selected skills
    │   │   ├── SkillItem.svelte                 # NEW: Individual skill item component
    │   │   ├── SkillItem.stories.svelte         # NEW: Stories for skill item
    │   │   ├── JobProfileForm.svelte            # NEW: Form for job name, description, company
    │   │   └── JobProfileForm.stories.svelte    # NEW: Stories for job profile form
    │   └── pages/
    │       ├── CreateJobPage.svelte             # NEW: Main page component for job creation
    │       └── CreateJobPage.stories.svelte      # NEW: Stories for full page (all states)
    └── routes/
        └── jobs/
            └── create/
                └── +page.svelte                 # NEW: Thin wrapper connecting load to CreateJobPage
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    +page.svelte (thin wrapper)              │
│                    - Handles route loading                  │
│                    - Passes data to CreateJobPage           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CreateJobPage.svelte                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  JobProfileForm                                       │  │
│  │  - Job name, description, company                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FrameworkSelector                                    │  │
│  │  - Searchable list of frameworks                     │  │
│  │  - Uses framework-service (real/fake via .env)      │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SkillsList (Left Column)                            │  │
│  │  - Fetches skills from selected framework            │  │
│  │  - Shows skeleton loading states                     │  │
│  │  - Displays SkillItem components with checkboxes    │  │
│  │  - Filter/search capability                          │  │
│  │  - Shows count (e.g., "10 of 25 selected")          │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      │ (selected skills)                    │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SelectedSkillsColumn (Right Column)                  │  │
│  │  - Shows selected skills for the job                 │  │
│  │  - Displays warning if >10 selected                  │  │
│  │  - Allows removing skills                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Save Button                                         │  │
│  │  - Validates form                                    │  │
│  │  - Shows success message                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              framework-service.ts                            │
│  - HttpService: Fetches from actual URLs via fetch          │
│  - FakeService: Returns mock JSON-LD data                   │
│  - Service interface for type safety                        │
│  - .env determines which service to use                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              frameworks.ts (config)                          │
│  - Predefined list of frameworks                            │
│  - Name, organization, URL for each                         │
│  - Type-safe configuration                                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### FrameworkSelector

- Displays searchable list of frameworks from config
- Handles framework selection
- Shows loading state when fetching framework data
- Emits selected framework to parent

### SkillsList

- Fetches skills from selected framework using framework-service
- Shows skeleton loading states (framework fetch, then skills fetch)
- Displays skills with SkillItem components
- Handles filtering/searching
- Shows selection count
- Manages checkbox state for each skill
- Emits selection changes to parent

### SkillItem

- Displays abbreviated skill view (label/text)
- Shows checkbox for selection
- Handles click to toggle selection

### SelectedSkillsColumn

- Displays selected skills in primary column
- Shows warning if >10 skills selected
- Allows removing skills from selection
- Shows suggestion text (5-10 skills recommended)

### JobProfileForm

- Form inputs for job name, description, company
- Form validation
- Emits form data to parent

### CreateJobPage

- Orchestrates all components
- Manages state (selected framework, selected skills, form data)
- Handles save action (shows success message)
- Coordinates between SkillsList and SelectedSkillsColumn
- Handles error states

## Data Flow

1. **Framework Selection**: User searches/selects framework → FrameworkSelector emits → CreateJobPage updates state → SkillsList fetches skills
2. **Skill Selection**: User checks/unchecks skill → SkillItem emits → SkillsList updates → CreateJobPage updates state → SelectedSkillsColumn updates
3. **Form Input**: User fills form → JobProfileForm emits → CreateJobPage updates state
4. **Save**: User clicks save → CreateJobPage validates → Shows success message (no persistence yet)

## Service Pattern

- `FrameworkService` interface defines contract
- `HttpFrameworkService` implements actual HTTP fetching
- `FakeFrameworkService` implements mock data for Storybook/testing
- `.env` configuration determines which service to instantiate (e.g., `USE_FAKE_FRAMEWORK_SERVICE=true`)
- Services handle JSON-LD parsing and error handling

## Type Definitions

- `Framework`: { name, organization, url, ctid }
- `Skill`: { url, label?, text, ctid }
- `JobProfile`: { name, description, company, frameworks: Framework[], skills: Skill[] }
- JSON-LD response types for framework and skill structures
