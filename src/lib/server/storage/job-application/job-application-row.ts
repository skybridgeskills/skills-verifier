import { z } from 'zod';

import type { JobApplication } from './job-application.js';

export const JobApplicationStatusSchema = z.enum(['pending', 'reviewing', 'accepted', 'rejected']);

/**
 * DynamoDB item shape for a job application (single-table design).
 */
export const JobApplicationRowSchema = z.object({
	PK: z.string(),
	SK: z.string(),
	GSI1PK: z.string(),
	GSI1SK: z.string(),
	id: z.string(),
	jobId: z.string(),
	candidateName: z.string(),
	candidateEmail: z.string(),
	resumeUrl: z.string().optional(),
	status: JobApplicationStatusSchema,
	createdAt: z.string()
});

export type JobApplicationRow = z.infer<typeof JobApplicationRowSchema>;

export function jobApplicationMetaKeys(
	id: string,
	jobId: string,
	createdAtIso: string
): Pick<JobApplicationRow, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'> {
	return {
		PK: `APP#${id}`,
		SK: 'META',
		GSI1PK: `JOB#${jobId}`,
		GSI1SK: `APP#${createdAtIso}#${id}`
	};
}

export function jobApplicationToRow(app: JobApplication): JobApplicationRow {
	const iso = app.createdAt.toISOString();
	return {
		...jobApplicationMetaKeys(app.id, app.jobId, iso),
		id: app.id,
		jobId: app.jobId,
		candidateName: app.candidateName,
		candidateEmail: app.candidateEmail,
		resumeUrl: app.resumeUrl,
		status: app.status,
		createdAt: iso
	};
}

export function rowToJobApplication(row: JobApplicationRow): JobApplication {
	return {
		id: row.id,
		jobId: row.jobId,
		candidateName: row.candidateName,
		candidateEmail: row.candidateEmail,
		resumeUrl: row.resumeUrl,
		status: row.status,
		createdAt: new Date(row.createdAt)
	};
}

export function parseJobApplicationRow(raw: unknown): JobApplicationRow {
	return JobApplicationRowSchema.parse(raw);
}
