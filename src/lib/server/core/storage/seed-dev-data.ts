import type { AppContext } from '$lib/server/app-context.js';
import { isMemoryDatabase } from '$lib/server/core/storage/types.js';
import { createJobQuery } from '$lib/server/domain/job/create-job-query.js';
import { createJobAppQuery } from '$lib/server/domain/job-app/create-job-app-query.js';

function skipSeed(): boolean {
	const v = process.env.SKIP_MEMORY_SEED?.toLowerCase();
	return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Inserts demo jobs and an application when using an empty {@link MemoryDatabase}.
 * Must run inside `runInContext(ctx, …)` so `createJobQuery` can call `appContext()`.
 */
export async function seedDevDataIfNeeded(ctx: AppContext): Promise<void> {
	if (!isMemoryDatabase(ctx.database) || skipSeed()) {
		return;
	}
	if (ctx.database.jobsById.size > 0) {
		return;
	}

	const job1 = await createJobQuery({
		externalId: 'seed-senior-engineer',
		name: 'Senior Engineer',
		description: 'Build and ship product features.',
		company: 'Skybridge Demo',
		frameworks: [],
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
				label: 'Health information systems',
				text: 'Understand and use health information systems effectively.',
				ctid: 'ce-777ff155-e07f-4843-9274-6a78783f6641'
			}
		],
		status: 'active'
	});

	await createJobQuery({
		externalId: 'seed-product-manager',
		name: 'Product Manager',
		description: 'Own roadmap and customer outcomes.',
		company: 'Skybridge Demo',
		frameworks: [],
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-4ffae58e-900e-43e0-ad2b-58f17858edfc',
				text: 'Apply foundational business concepts to management scenarios.',
				ctid: 'ce-4ffae58e-900e-43e0-ad2b-58f17858edfc'
			}
		],
		status: 'active'
	});

	await createJobAppQuery({
		jobId: job1.id,
		candidateName: 'Alex Example',
		candidateEmail: 'alex@example.com',
		status: 'pending'
	});
}
