import { error, fail } from '@sveltejs/kit';
import QRCode from 'qrcode';
import { z } from 'zod';

import { appContext } from '$lib/server/app-context.js';
import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import { MatchAssignment } from '$lib/server/domain/match/match-resource.js';
import { saveMatchAssignmentsQuery } from '$lib/server/domain/match/save-match-assignments-query.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { appLogger } from '$lib/server/services/logging/index.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// IDENTITY (fast-follow): ownership/session would attach here
	const job = await jobByIdQuery({ id: params.id });
	if (!job) error(404, 'Job not found');
	const match = await matchByIdQuery({ id: params.matchId });
	if (!match || match.jobId !== job.id) error(404, 'Match not found');
	return { job, match };
};

export const actions: Actions = {
	startExchange: async ({ params, locals }) => {
		const match = await matchByIdQuery({ id: params.matchId });
		if (!match || match.jobId !== params.id) {
			return fail(404, { error: 'Match not found' });
		}

		const { verificationExchange } = appContext();
		let exchangeId: string;
		let protocols: { iu: string; vcapi: string; lcw: string };
		try {
			const created = await verificationExchange.createVerifyExchange();
			exchangeId = created.exchangeId;
			protocols = created.protocols;
		} catch (err) {
			appLogger().error(
				{ err, matchId: params.matchId, requestId: locals.requestId },
				'startExchange: failed to create verify exchange'
			);
			return fail(502, { error: 'Could not start verification exchange' });
		}

		await saveMatchCredentialsQuery({
			id: params.matchId,
			exchangeId,
			vcapi: protocols.vcapi,
			exchangeState: 'pending'
		});

		const qrDataUrl = await QRCode.toDataURL(protocols.iu);

		return {
			iu: protocols.iu,
			lcw: protocols.lcw,
			vcapi: protocols.vcapi,
			qrDataUrl,
			exchangeId
		};
	},

	saveAssignments: async ({ params, request }) => {
		const match = await matchByIdQuery({ id: params.matchId });
		if (!match || match.jobId !== params.id) {
			return fail(404, { error: 'Match not found' });
		}
		const job = await jobByIdQuery({ id: params.id });
		if (!job) {
			return fail(404, { error: 'Job not found' });
		}

		const fd = await request.formData();
		const raw = String(fd.get('assignmentsJson') ?? '');
		let parsedJson: unknown;
		try {
			parsedJson = raw ? JSON.parse(raw) : [];
		} catch {
			return fail(400, { error: 'Invalid assignments payload' });
		}

		const parsed = z.array(MatchAssignment.schema).safeParse(parsedJson);
		if (!parsed.success) {
			return fail(400, { error: 'Assignments must be a valid list' });
		}

		// Validate refs: each assignment must point at a real job skill and a verified
		// credential on this match. Reject unknown references rather than silently dropping.
		const jobSkills = new Set(job.skills.map((s) => `${s.ctid}|${s.url}`));
		const credentialIds = new Set(match.verifiedCredentials.map((c) => c.credentialId));
		for (const a of parsed.data) {
			if (!jobSkills.has(`${a.skillCtid}|${a.skillUrl}`)) {
				return fail(400, { error: `Unknown skill reference: ${a.skillCtid}` });
			}
			if (!credentialIds.has(a.credentialId)) {
				return fail(400, { error: `Unknown credential reference: ${a.credentialId}` });
			}
		}

		await saveMatchAssignmentsQuery({ id: params.matchId, assignments: parsed.data });
		return { success: true };
	}
};
