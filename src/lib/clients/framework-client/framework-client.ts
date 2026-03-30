import { FakeFrameworkClient } from '$lib/clients/framework-client/fake-framework-client';
import { HttpFrameworkClient } from '$lib/clients/framework-client/http-framework-client';
import type { Framework, Skill } from '$lib/types/job-profile';

/**
 * Response type for framework fetch operations.
 */
export interface FrameworkResponse {
	framework: Framework;
	skillUrls: string[];
}

/**
 * Response type for skill fetch operations.
 */
export interface SkillResponse {
	skill: Skill;
}

/**
 * Service interface for fetching framework and skill data.
 */
export interface FrameworkClient {
	/**
	 * Fetches a framework by URL and returns framework data with skill URLs.
	 * @param url - The URL of the framework JSON-LD resource
	 * @returns Promise resolving to framework data and array of skill URLs
	 * @throws Error if fetch fails, JSON is invalid, or structure is invalid
	 */
	fetchFramework(url: string): Promise<FrameworkResponse>;

	/**
	 * Fetches a skill by URL and returns skill data.
	 * @param url - The URL of the skill JSON-LD resource
	 * @returns Promise resolving to skill data
	 * @throws Error if fetch fails, JSON is invalid, or structure is invalid
	 */
	fetchSkill(url: string): Promise<SkillResponse>;
}

/**
 * Creates a FrameworkClient instance based on environment configuration.
 * Reads PUBLIC_USE_FAKE_FRAMEWORK_SERVICE from environment variables.
 * Uses import.meta.env which SvelteKit populates from PUBLIC_ prefixed env vars.
 * @returns FrameworkClient instance (HttpFrameworkClient or FakeFrameworkClient)
 */
export function createFrameworkService(): FrameworkClient {
	const useFake =
		import.meta.env.PUBLIC_USE_FAKE_FRAMEWORK_SERVICE === 'true' ||
		import.meta.env.PUBLIC_USE_FAKE_FRAMEWORK_SERVICE === true;

	return useFake ? new FakeFrameworkClient() : new HttpFrameworkClient();
}
/** Shape of the framework client slice (for satisfies). */
export type FrameworkClientSlice = {
	frameworkClient: FrameworkClient;
};

export const FrameworkClientCtx = () =>
	({ frameworkClient: createFrameworkService() }) satisfies FrameworkClientSlice;
export type FrameworkClientCtx = ReturnType<typeof FrameworkClientCtx>;
