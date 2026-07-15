import type { LayoutServerLoad } from './$types';

/** Exposes the admin flag to the layout so the header can show admin-only controls. */
export const load: LayoutServerLoad = async ({ locals }) => ({ admin: locals.admin });
