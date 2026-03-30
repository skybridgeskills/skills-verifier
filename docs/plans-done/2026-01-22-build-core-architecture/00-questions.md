# Questions

## 1. Monorepo vs Single Project Structure

Should `skills-verifier` remain a standalone SvelteKit project, or should it be integrated into the `skybridgeskills-monorepo`? The notes mention "Might still want turbo to orchestrate the build even though it is just a single project sveltekit app."

**Suggested approach**: Keep it as a standalone project for now, but set up turbo.json for task orchestration. This allows for future integration into the monorepo if needed, while maintaining independence. Turbo can still provide caching and task orchestration benefits even for a single project.

Answer: Keep it as a standalone project for now, but set up turbo.json for task orchestration. Turbo can still provide caching and task orchestration benefits even for a single project.

## 2. JobPosting Immutability Strategy

The notes mention "Consider making JobPostings not modifiable, modifications will create a new one so that we don't have mismatches between submissions and postings. Maybe a parent/basedOn attribute identifies the original version it was forked from."

Should we implement this immutability pattern from the start, or start with mutable postings and add immutability later?

**Suggested approach**: Start with immutable postings from the beginning. This prevents data integrity issues and aligns with the requirement. Include a `basedOn` field (optional, for original postings) to track lineage.

Start with immutable postings from the beginning. This prevents data integrity issues and aligns with the requirement. Include a `basedOn` field (optional, for original postings) to track lineage. Make sure that when a new user goes to a posting that has been replaced, they can't apply to the old version. Ideally they could be directed to the new version of the posting. We need to make sure that the strategy is robust for our datastore, for instance, we may make it so that the content_json or whatever of the posting is not modified, but an archived flag may be set to indicate that the posting is no longer the current version. This will require some more thinking to both enable redirects to the latest version without breaking the optimization of the key/value store style database.

## 3. Storage Backend Priority

Which storage backend should we implement first: in-memory (for testing/dev), or DynamoDB (for AWS deployment)?

Answer: Start with in-memory implementation for rapid development and testing, then add deployable databases such as DynamoDB later when AWS deployment is needed. This follows the pattern seen in the monorepo where memory databases are used for dev/testing. On startup, we should populate the memory database with appropriate test data representing a couple different scenarios, so that the developer can work on these fixtures with the in-memory database and keep them up to date with the data schema instead of relying on potentially fragile local database state.

## 4. Submission Data Structure

What data should a Submission contain? Should it reference a JobPosting ID, include the full job profile data, or both?

**Suggested approach**: Submission should reference a JobPosting ID and include a snapshot of the job profile data at submission time. This ensures we can verify submissions against the exact job posting version they were created for, even if the posting is later modified (though postings are immutable, this provides extra safety).

Answer: If JobPosting content is immutable, then Submission should only reference the JobPosting ID and not the full job profile data.

## 5. Skills Framework Service Integration

The existing `FrameworkClient` fetches from external URLs. Should the Skills Framework Service wrap this, or should it be a separate service that lists available frameworks (potentially cached)?

**Suggested approach**: Create a `SkillsFrameworkService` that can list available frameworks (with caching) and wraps the existing `FrameworkClient` for fetching. This provides a clean separation: FrameworkClient handles HTTP fetching, SkillsFrameworkService handles framework discovery and listing.

Answer: We can update the names from the initial prototype code to be more descriptive of the new service boundaries. The SkillsFrameworkService should have an interface that allows async fetching of frameworks and skills, and a way to list available frameworks. There should be both static-sourced and HTTP-sourced versions of the service, which can be part of the app context provided to request handlers. It would be nice to have some amount of caching of frameworks and skills fetched over HTTP for performance reasons, with the ability to override the cache with a fresh fetch if needed (for example if somebody is actively working on the framework as they test it with creating job postings).

## 6. ConfigService Environment Variable Naming

The notes mention "Env vars are no longer in `SCREAMING_SNAKE_CASE` etc." Should we use camelCase for the parsed config object while still reading from SCREAMING_SNAKE_CASE env vars, or use a different convention?

Answer: Read from SCREAMING_SNAKE_CASE env vars (standard practice) but provide a camelCase config object through ConfigService. This gives us type-safe, developer-friendly access while maintaining standard environment variable conventions.

## 7. Storybook Navigation Interception

The notes mention intercepting navigation actions in Storybook to create coherent story arcs. Should this be implemented in the initial phases or deferred?

Answer: Defer this to a later phase. Focus on getting the core architecture and AppForStory integration working first. The navigation interception is a nice-to-have enhancement that can be added once the foundation is solid.

## 8. Turbo Task Configuration

What tasks should be configured in turbo.json? The notes mention: format, eslint, test, storybook test, e2e test, build.

Answer: Configure all mentioned tasks:

- `format` - runs prettier
- `lint` - runs eslint
- `test` - runs vitest unit tests
- `test:storybook` - runs storybook tests
- `test:e2e` - runs playwright e2e tests
- `build` - runs vite build
- `validate` - runs lint, test, test:e2e together (cached)

## 9. GitHub Actions Workflow

Should we set up automated versioning (semantic-release or git-auto-semver) in the initial phases, or defer until we have releases to manage?

Answer: Set up the GitHub Actions workflow structure and conventional commits validation in the initial phases, but defer automated versioning until we're ready for actual releases. This ensures we're following the right commit conventions from the start.

## 10. ID Generation Utility Location

The notes mention copying ID generation code from sbs into lib/util. Should this be a direct copy or adapted for this project's needs?

Answer: Copy the Base62Uid utility from the monorepo and adapt it to work standalone (removing monorepo-specific dependencies if any). This gives us proven, secure ID generation from the start.

## 11. JobPosting Version Management and Lookup Strategy

The answer to question #2 mentions several important concerns about handling replaced/archived postings:

- Redirecting users from old versions to new versions
- Using an archived flag vs modifying content
- Maintaining key/value store optimization while enabling "latest version" lookups

**Clarifying questions needed:**

## 12. Latest Version Lookup Strategy

For a key-value store (like DynamoDB), how should we efficiently find the "current" version of a posting?

**Answer**: Use a two-level structure:

- **JobPostingIndex** document with ID scheme `sv:job:<id>` - contains metadata and list of version IDs
- **JobPosting** content documents with ID scheme `sv:job-content:<id>` - contains actual posting data

This enables O(1) lookup: fetch index by `sv:job:<id>`, then fetch latest content by the `currentVersionId` from the index. The URI scheme (`sv:job:`, `sv:job-content:`) makes document types explicit in the key/value store.

## 13. JobPostingIndex Structure

What fields should the JobPostingIndex contain?

**Answer**:

- `currentVersionId`: `sv:job-content:<id>` - ID of latest version
- `versions`: Array of objects with `{id: sv:job-content:<id>, createdAt: <timestamp>}` - all versions with timestamps

This structure tracks all versions with their creation timestamps, enabling history/listing while maintaining O(1) access to current version.

## 14. Version Creation Process

When creating a new version of a posting:

1. Create new `sv:job-content:<newVersionId>` with content
2. Update JobPostingIndex: set `currentVersionId` to new ID, add to `versions` array
3. Mark old version as archived (how? separate field in posting, or just not-current in index?)

Should this be atomic/transactional, or is eventual consistency acceptable?

**Answer**: Use this approach to try to create consistency between store services of different types. We don't want partial failures, but the approach to achieve atomicity will vary by underlying datastore:

- In-memory store: Truly atomic operations
- DynamoDB: Use conditional writes to ensure consistency
- Other stores: Use appropriate transactional mechanisms for that datastore

The goal is consistent behavior across store implementations, even if the mechanism differs. Old versions are implicitly archived (not-current), tracked via the `versions` array with timestamps.

## 15. Primary ID and URL Mapping

What is the "primary ID" that users see in URLs? Is it:

- The index ID (`sv:job:<id>`)?
- A human-friendly slug/identifier stored in the index?
- Just the `<id>` part extracted from `sv:job:<id>`?

**Answer**: Use just the `<id>` part extracted from `sv:job:<id>`. This translates to the primary key used to look up the document in the key/value store. Since we're storing documents by their ID (not by slug), we shouldn't use slugs that aren't the document's primary key. URLs would be `/jobs/<id>` where `<id>` is the ID portion of `sv:job:<id>`. The full `sv:job:<id>` is used as the storage key.

## 16. Content Document to Index Reference

Each content document needs to reference the index document it belongs to. What should this field be called and where should it live?

**Answer**: Each content document (`sv:job-content:<id>`) should include a `jobPostingId` field that references the index document ID (`sv:job:<id>`). Example structure:

```json
{
	"id": "sv:job-content:abc123",
	"jobPostingId": "sv:job:def456"
	// ... other job posting content fields
}
```

This creates a bidirectional relationship: the index knows its versions via `currentVersionId` and `versions`, and each content document knows which index it belongs to.

## 17. Forking/Lineage Tracking (basedOn)

The original notes mentioned a `basedOn` field for tracking when a posting is forked from another posting. Given the index-content structure, where should this live and what should it be called?

**Answer**: We don't need to support forking postings from other postings for now. This feature can be deferred to a later phase if needed.

## 18. Redirect Handling Location

Where should the redirect logic live when a user accesses an archived posting?

- In the route handler (before loading data)
- In the store service (as part of the get operation)
- As a separate middleware/service

**Answer**: Handle in the route handler - fetch JobPostingIndex by ID, check if `currentVersionId` differs from requested version (if version specified), redirect if needed. This keeps business logic out of the storage layer.

## 19. URL Structure

Given the two-level structure and ID-based URLs, what should the URL patterns be?

- `/jobs/[id]` - always shows current version (fetches index by `sv:job:[id]`, then currentVersionId)
- `/jobs/[id]/versions/[versionId]` - view specific version (for admin/historical)
- `/jobs/[id]` with query param `?version=[versionId]` for viewing old versions

**Answer**: Use `/jobs/[id]` that always shows current version (where `[id]` is the ID portion of `sv:job:[id]`). Old versions accessible via `/jobs/[id]/versions/[versionId]` for admin/historical viewing. Submissions can only be created against current versions (enforced by checking `currentVersionId` matches the version being submitted to).
