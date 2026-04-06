import type { Job } from '../job/job.js';
import type { JobApplication } from '../job-application/job-application.js';

/**
 * In-memory tables for tests and local development.
 */
export class MemoryDatabase {
	readonly $type = 'memory' as const;

	readonly jobsById = new Map<string, Job>();

	readonly jobApplicationsById = new Map<string, JobApplication>();
}
