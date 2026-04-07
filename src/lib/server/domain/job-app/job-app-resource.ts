import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

import { AppResourceFields } from '../core/app-resource.js';

/**
 * Status values for a job app (candidate application to a job).
 */
export const JobAppStatus = ZodFactory(z.enum(['pending', 'reviewing', 'accepted', 'rejected']));
export type JobAppStatus = ReturnType<typeof JobAppStatus>;

/**
 * JobAppResource represents a candidate's application to a job.
 * Extends AppResource pattern.
 */
export const JobAppResource = ZodFactory(
	z.object({
		// AppResource base fields
		id: AppResourceFields.id,
		createdAt: AppResourceFields.createdAt,

		// JobApp-specific fields
		jobId: z.string(),
		candidateName: z.string(),
		candidateEmail: z.string(),
		resumeUrl: z.string().optional(),
		status: JobAppStatus.schema
	})
);
export type JobAppResource = ReturnType<typeof JobAppResource>;

/**
 * Parameters for creating a new JobAppResource.
 * Derived from JobAppResource schema by omitting auto-generated fields.
 */
export const CreateJobAppParams = z.object({
	jobId: JobAppResource.schema.shape.jobId,
	candidateName: JobAppResource.schema.shape.candidateName,
	candidateEmail: JobAppResource.schema.shape.candidateEmail,
	resumeUrl: JobAppResource.schema.shape.resumeUrl,
	status: JobAppStatus.schema.default('pending')
});
export type CreateJobAppParams = z.infer<typeof CreateJobAppParams>;
