# Phase 6: Cleanup & validation

## Scope of phase

- Remove all TODO comments related to this plan
- Run final validation checks
- Fix any lint/formatting issues
- Verify no dead code or unused imports
- Prepare for commit

## Cleanup checklist

### 6.1 Search and remove TODOs

```bash
# Search for TODOs introduced during this plan
grep -r "TODO.*Phase" src/lib/server/services/skill-search/ || true
grep -r "TODO.*[012345]" src/lib/server/ || true
```

Common TODOs to remove or address:

- `TODO: Phase 3 - add conditional real CE provider` (should be resolved)
- Any temporary `console.log` statements
- Debug code or commented-out sections

### 6.2 Search for unused code

Check for:

- Unused imports in new files
- Dead code paths (e.g., AWS context throws before Phase 3)
- Unused exports

```bash
pnpm check
# Look for "declared but never read" warnings
```

### 6.3 Verify file organization

Check each new file adheres to conventions:

- High-level exports at top
- Main implementation follows
- Helpers at bottom
- Under ~200 lines (split if needed)

### 6.4 Final type check

```bash
pnpm check:typescript
```

### 6.5 Final lint check

```bash
pnpm check:eslint
```

### 6.6 Final format check

```bash
pnpm check:prettier
# Or fix with:
pnpm fix:prettier
```

### 6.7 Full test run

```bash
CONTEXT=test pnpm test:vitest
```

Verify:

- All tests pass
- No test failures or errors
- No console warnings during test run

### 6.8 Dev server smoke test

```bash
# Start dev server, verify no errors on boot
CONTEXT=dev pnpm dev
# Or without CONTEXT (defaults to dev)
pnpm dev
```

### 6.9 AWS context dry-run (optional)

If possible, test AWS context locally with CE sandbox:

```bash
# Set CE sandbox credentials
CONTEXT=dev \
  CREDENTIAL_ENGINE_SEARCH_URL=https://sandbox.credentialengine.org/assistant/search/ctdl \
  CREDENTIAL_ENGINE_API_KEY=your-sandbox-key \
  pnpm dev

# Test API route with real CE (if you have sandbox access)
curl -X POST http://localhost:5173/api/skill-search \
  -H "Content-Type: application/json" \
  -d '{"query": "nursing", "limit": 5}'
```

## Validate

Final comprehensive check:

```bash
# Run all check scripts
pnpm check

# Run all tests
CONTEXT=test pnpm test:vitest

# Verify build works
pnpm build:svelte
```

## Commit preparation

When ready to commit, use Conventional Commits format:

```
feat(backend): add skill search service with CE integration

- Add hexagonal skill search port with fake and CE adapters
- Add CONTEXT=aws|dev|test environment dispatch
- Implement Credential Engine Registry Search API client
- Add POST/GET /api/skill-search endpoint
- Add comprehensive tests for all adapters and routes
- Document deployment configuration in docs/deployment.md
```

## Summary of changes

### Files created

- `src/lib/server/app-env.ts` — Environment parsing with Zod
- `src/lib/server/build-app-context.ts` — Context dispatch
- `src/lib/server/aws-app-context.ts` — AWS production context
- `src/lib/server/services/skill-search/skill-search-service.ts` — Port + DTOs
- `src/lib/server/services/skill-search/fake-skill-search-service.ts` — Fake adapter
- `src/lib/server/services/skill-search/provide-fake-skill-search-service.ts` — Fake provider
- `src/lib/server/services/skill-search/fake-skill-search-service.test.ts` — Fake adapter tests
- `src/lib/server/services/skill-search/credential-engine/credential-engine-skill-search-service.ts` — CE adapter
- `src/lib/server/services/skill-search/credential-engine/provide-credential-engine-skill-search-service.ts` — CE provider
- `src/lib/server/services/skill-search/credential-engine/credential-engine-search-request.ts` — Request builder
- `src/lib/server/services/skill-search/credential-engine/map-credential-engine-search-response.ts` — Response mapper
- `src/lib/server/services/skill-search/credential-engine/map-credential-engine-search-response.test.ts` — Mapper tests
- `src/lib/server/services/skill-search/credential-engine/credential-engine-skill-search-service.test.ts` — CE adapter tests
- `src/lib/server/services/skill-search/credential-engine/fixtures/ce-search-response.json` — Test fixtures
- `src/routes/api/skill-search/+server.ts` — API route
- `src/routes/api/skill-search/+server.test.ts` — Route tests
- `src/lib/server/app-env.test.ts` — Env parsing tests
- `src/lib/server/test-app-context.test.ts` — Test context verification

### Files modified

- `src/lib/server/app-context.ts` — Add `skillSearchService`
- `src/lib/server/dev-app-context.ts` — Accept env param, add conditional skill search
- `src/lib/server/test-app-context.ts` — Accept env param, add fake skill search
- `src/hooks.server.ts` — Use `$env/dynamic/private`, dispatch on CONTEXT
- `.env.example` — Add new environment variables
- `package.json` — Add `CONTEXT=test` to test scripts

### Documentation updated

- `docs/deployment.md` — Deployment configuration guide
- `docs/plans/2026-04-07-skill-search-service/` — This plan

## Plan completion

Once all checks pass:

1. Review `docs/plans/2026-04-07-skill-search-service/` for completeness
2. Move plan to `docs/plans-done/2026-04-07-skill-search-service/`
3. Create `summary.md` in completed plan folder
4. Commit with Conventional Commits message

## Post-implementation notes

Future work (separate plans):

- Replace `FrameworkSelector` + `SkillsList` with skill search UI
- Add caching layer for CE responses
- Add rate limiting for CE API calls
- Add observability/metrics for search operations
