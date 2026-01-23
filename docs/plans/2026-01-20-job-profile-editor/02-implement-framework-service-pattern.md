# Phase 2: Implement Framework Service Pattern

## Overview
Create the FrameworkService interface and implement both HttpFrameworkService (HTTP fetching) and FakeFrameworkService (mock data). Add service factory that reads .env to determine which service to use.

## Tasks

1. Create `src/lib/services/framework-service.ts` with:
   - `FrameworkService` interface with methods:
     - `fetchFramework(url: string): Promise<FrameworkResponse>`
     - `fetchSkill(url: string): Promise<SkillResponse>`
   - `HttpFrameworkService` class implementing the interface:
     - Uses `fetch` to get JSON-LD from URLs
     - Parses JSON-LD responses
     - Handles errors (network, invalid JSON, invalid structure)
   - `FakeFrameworkService` class implementing the interface:
     - Returns mock JSON-LD data matching the structure
     - Includes mock data for both example frameworks
   - Service factory function that reads `.env` to determine which service to instantiate

2. Handle JSON-LD parsing:
   - Extract `ceasn:name`, `ceasn:publisherName`, `ceterms:ctid` from framework responses
   - Extract `ceasn:hasTopChild` array from framework responses
   - Extract `ceasn:competencyLabel`, `ceasn:competencyText`, `ceterms:ctid` from skill responses
   - Handle language-specific fields (e.g., `{"en-us": "value"}`)

3. Error handling:
   - Network errors → throw with clear message
   - Invalid JSON → throw with clear message
   - Missing required fields → throw with clear message
   - Invalid JSON-LD structure → throw with clear message

## Tests

- Unit tests for `HttpFrameworkService` (with mocked fetch)
- Unit tests for `FakeFrameworkService`
- Unit tests for service factory
- Error handling tests

## Success Criteria

- [ ] FrameworkService interface defined
- [ ] HttpFrameworkService fetches and parses JSON-LD correctly
- [ ] FakeFrameworkService returns mock data correctly
- [ ] Service factory reads .env and returns correct service
- [ ] Error handling works for all error cases
- [ ] All tests pass (`pnpm test:unit`)
- [ ] All code compiles (`pnpm build` succeeds)
- [ ] No TypeScript errors (`pnpm check` passes)
