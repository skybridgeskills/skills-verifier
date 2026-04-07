import { z } from 'zod';

import { ZodFactory } from '$lib/server/util/zod-factory.js';

import { AppResourceFields } from '../../core/storage/app-resource.js';

/**
 * Framework represents a competency framework from Credential Engine Registry.
 */
export const FrameworkResource = ZodFactory(
	z.object({
		name: z.string(),
		organization: z.string(),
		url: z.string(),
		ctid: z.string()
	})
);
export type FrameworkResource = ReturnType<typeof FrameworkResource>;

/**
 * Skill represents a competency/skill from a framework.
 */
export const SkillResource = ZodFactory(
	z.object({
		url: z.string(),
		label: z.string().optional(),
		text: z.string(),
		ctid: z.string()
	})
);
export type SkillResource = ReturnType<typeof SkillResource>;

/**
 * Job status values.
 */
export const JobStatus = ZodFactory(z.enum(['active', 'closed', 'draft']));
export type JobStatus = ReturnType<typeof JobStatus>;

/**
 * JobResource represents a job posting with required skills and frameworks.
 * This is the domain/DTO layer (Resource) - extends AppResource pattern.
 */
export const JobResource = ZodFactory(
	z.object({
		// AppResource base fields
		id: AppResourceFields.id,
		createdAt: AppResourceFields.createdAt,

		// Job-specific fields
		externalId: z.string(),
		externalUrl: z.string().optional(),
		name: z.string(),
		description: z.string(),
		company: z.string(),
		frameworks: z.array(FrameworkResource.schema),
		skills: z.array(SkillResource.schema),
		status: JobStatus.schema
	})
);
export type JobResource = ReturnType<typeof JobResource>;

/**
 * Parameters for creating a new JobResource.
 * Derived from JobResource schema by omitting auto-generated fields.
 */
export const CreateJobParams = z.object({
	externalId: JobResource.schema.shape.externalId,
	externalUrl: JobResource.schema.shape.externalUrl,
	name: JobResource.schema.shape.name,
	description: JobResource.schema.shape.description,
	company: JobResource.schema.shape.company,
	frameworks: z.array(FrameworkResource.schema).default([]),
	skills: z.array(SkillResource.schema).min(1, 'At least one skill is required'),
	status: JobStatus.schema.default('active')
});
export type CreateJobParams = z.infer<typeof CreateJobParams>;
