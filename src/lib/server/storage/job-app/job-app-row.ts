import { z } from 'zod';

import { AppRowFields } from '../core/app-row.js';

import { JobAppResource, JobAppStatus } from './job-app-resource.js';
import type { JobAppResource as JobAppResourceType } from './job-app-resource.js';

/**
 * DynamoDB item shape for a job app (single-table design).
 * Extends AppRow with domain-specific fields.
 */
export const JobAppRow = z.object({
	// AppRow base fields
	PK: AppRowFields.PK,
	SK: AppRowFields.SK,
	GSI1PK: AppRowFields.GSI1PK,
	GSI1SK: AppRowFields.GSI1SK,

	// Domain fields (referenced from source schema for consistency)
	id: JobAppResource.schema.shape.id,
	jobId: JobAppResource.schema.shape.jobId,
	candidateName: JobAppResource.schema.shape.candidateName,
	candidateEmail: JobAppResource.schema.shape.candidateEmail,
	resumeUrl: JobAppResource.schema.shape.resumeUrl,
	status: JobAppStatus.schema,
	createdAt: z.string()
});

export type JobAppRow = z.infer<typeof JobAppRow>;

export function jobAppMetaKeys(
	id: string,
	jobId: string,
	createdAtIso: string
): Pick<JobAppRow, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'> {
	return {
		PK: `APP#${id}`,
		SK: 'META',
		GSI1PK: `JOB#${jobId}`,
		GSI1SK: `APP#${createdAtIso}#${id}`
	};
}

export function jobAppToRow(app: JobAppResourceType): JobAppRow {
	const iso = app.createdAt.toISOString();
	return {
		...jobAppMetaKeys(app.id, app.jobId, iso),
		id: app.id,
		jobId: app.jobId,
		candidateName: app.candidateName,
		candidateEmail: app.candidateEmail,
		resumeUrl: app.resumeUrl,
		status: app.status,
		createdAt: iso
	};
}

export function rowToJobAppResource(row: JobAppRow): JobAppResourceType {
	return JobAppResource({
		id: row.id,
		jobId: row.jobId,
		candidateName: row.candidateName,
		candidateEmail: row.candidateEmail,
		resumeUrl: row.resumeUrl,
		status: row.status,
		createdAt: new Date(row.createdAt)
	});
}

export function parseJobAppRow(raw: unknown): JobAppRow {
	return JobAppRow.parse(raw);
}
