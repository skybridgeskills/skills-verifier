import { json } from '@sveltejs/kit';

import { buildVersionBody } from '$lib/server/util/build-version-body.js';

import type { RequestHandler } from './$types';

/**
 * Deploy metadata (OSMT-style). Monorepo images set SKILLS_VERIFIER_VERSION, SBS_MONOREPO_VERSION, etc.
 */
export const GET: RequestHandler = async () => json(buildVersionBody());
