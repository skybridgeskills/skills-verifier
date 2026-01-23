# Phase 1: Create Type Definitions and Framework Configuration

## Overview
Create TypeScript type definitions for frameworks, skills, and job profiles. Create the framework configuration file with predefined frameworks. Create .env.example file.

## Tasks

1. Create `src/lib/types/job-profile.ts` with:
   - `Framework` type: { name: string, organization: string, url: string, ctid: string }
   - `Skill` type: { url: string, label?: string, text: string, ctid: string }
   - `JobProfile` type: { name: string, description: string, company: string, frameworks: Framework[], skills: Skill[] }
   - JSON-LD response types for framework and skill structures

2. Create `src/lib/config/frameworks.ts` with:
   - Predefined list of frameworks:
     - "Health Information Management" by "Dyersburg State Community College": `https://credentialengineregistry.org/resources/ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd`
     - "Business, Management" by "Chattanooga State Community College": `https://credentialengineregistry.org/resources/ce-07220a5c-0f8a-4c5f-a458-acaebeea13f9`
   - Export typed array of frameworks

3. Create `.env.example` file with:
   - `USE_FAKE_FRAMEWORK_SERVICE=false` (or similar configuration)

## Tests

- No tests needed for this phase (types and config only)

## Success Criteria

- [ ] Type definitions compile without errors
- [ ] Framework configuration file exports properly typed array
- [ ] .env.example file created with service configuration
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
