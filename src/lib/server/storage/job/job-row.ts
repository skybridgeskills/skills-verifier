import { z } from 'zod';

import type { Job } from './job.js';
import { ZodFactory } from '$lib/server/util/zod-factory.js';

export const FrameworkSchema = ZodFactory(
	z.object({
		name: z.string(),
		organization: z.string(),
		url: z.string(),
		ctid: z.string()
	})
);

export const SkillSchema = ZodFactory(
	z.object({
		url: z.string(),
		label: z.string().optional(),
		text: z.string(),
		ctid: z.string()
	})
);

export const JobStatus = ZodFactory(z.enum(['active', 'closed', 'draft']));

export const JobInfo = ZodFactory(
	z.object({
		sourceId: z.string().optional(),
		sourceUrl: z.string().optional(),
		label: z.string(),
		description: z.string(),
		company: z.string(),
		location: z.string().optional(),
		skills: z.array(SkillSchema),
		createdAt: z.date()
	})
);

/**
 * DynamoDB item shape for a job (single-table design).
 */
export const JobRow = z.object({
	PK: z.string(),
	SK: z.string(),
	GSI1PK: z.string(),
	GSI1SK: z.string(),
	id: z.string(),
	externalId: z.string(),
	externalUrl: z.string().optional(),
	name: z.string(),
	description: z.string(),
	company: z.string(),
	frameworks: z.array(FrameworkSchema),
	skills: z.array(SkillSchema),
	status: JobStatus,
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

export function jobToRow(job: Job): JobRow {
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

export function rowToJob(row: JobRow): Job {
	return {
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
	};
}

export function parseJobRow(raw: unknown): JobRow {
	return JobRow.parse(raw);
}
