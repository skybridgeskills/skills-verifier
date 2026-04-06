import { z } from 'zod';

import { AppRowFields } from '../core/app-row.js';

import type { JobResource } from './job-resource.js';
import { FrameworkResource, SkillResource, JobStatus, JobResource } from './job-resource.js';

/**
 * DynamoDB item shape for a job (single-table design).
 * Extends AppRow with domain-specific fields.
 */
export const JobRow = z.object({
	// AppRow base fields
	PK: AppRowFields.PK,
	SK: AppRowFields.SK,
	GSI1PK: AppRowFields.GSI1PK,
	GSI1SK: AppRowFields.GSI1SK,

	// Domain fields (referenced from source schema for consistency)
	id: JobResource.schema.shape.id,
	externalId: JobResource.schema.shape.externalId,
	externalUrl: JobResource.schema.shape.externalUrl,
	name: JobResource.schema.shape.name,
	description: JobResource.schema.shape.description,
	company: JobResource.schema.shape.company,
	frameworks: z.array(FrameworkResource.schema),
	skills: z.array(SkillResource.schema),
	status: JobStatus.schema,
	createdAt: z.string()
});

export type JobRow = z.infer<typeof JobRow>;

export function jobMetaKeys(
	id: string,
	externalId: string
): Pick<JobRow, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'> {
	return {
		PK: `JOB#${id}`,
		SK: 'META',
		GSI1PK: `EXTERNAL#${externalId}`,
		GSI1SK: 'META'
	};
}

export function jobToRow(job: JobResource): JobRow {
	return {
		...jobMetaKeys(job.id, job.externalId),
		id: job.id,
		externalId: job.externalId,
		externalUrl: job.externalUrl,
		name: job.name,
		description: job.description,
		company: job.company,
		frameworks: job.frameworks,
		skills: job.skills,
		status: job.status,
		createdAt: job.createdAt.toISOString()
	};
}

export function rowToJobResource(row: JobRow): JobResource {
	return JobResource({
		id: row.id,
		externalId: row.externalId,
		externalUrl: row.externalUrl,
		name: row.name,
		description: row.description,
		company: row.company,
		frameworks: row.frameworks,
		skills: row.skills,
		status: row.status,
		createdAt: new Date(row.createdAt)
	});
}

export function parseJobRow(raw: unknown): JobRow {
	return JobRow.parse(raw);
}
