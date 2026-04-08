import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

/** ALB target health; no external I/O. */
export const GET: RequestHandler = async () => json({ ok: true });
