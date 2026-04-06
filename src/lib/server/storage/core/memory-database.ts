import type { JobResource } from '../job/job-resource.js';
import type { JobAppResource } from '../job-app/job-app-resource.js';

/**
 * In-memory tables for tests and local development.
 */
export class MemoryDatabase {
	readonly $type = 'memory' as const;

	readonly jobsById = new Map<string, JobResource>();

	readonly jobAppsById = new Map<string, JobAppResource>();
}
