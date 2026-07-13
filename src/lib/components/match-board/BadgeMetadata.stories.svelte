<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { BadgeDetail } from './badge-detail.js';
	import BadgeMetadata from './BadgeMetadata.svelte';
	import type { VerificationProblem } from './types.js';

	// A small inline SVG data: URL so the image story renders without a network fetch.
	const sampleImage =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="16" fill="%23f97316"/><text x="48" y="58" font-size="40" text-anchor="middle" fill="white">★</text></svg>'
		);

	const fullDetail: BadgeDetail = {
		achievementName: 'Certified Kubernetes Administrator',
		issuerName: 'Cloud Native Computing Foundation',
		issuerUrl: 'https://cncf.example',
		issuerEmail: 'badges@cncf.example',
		validFrom: '2024-03-01T00:00:00Z',
		validUntil: '2027-03-01T00:00:00Z',
		description:
			'Demonstrates the ability to install, configure, and operate production-grade Kubernetes clusters, including networking, storage, and workload scheduling.',
		imageUrl: sampleImage
	};

	const minimalDetail: BadgeDetail = {
		issuerName: 'DevOps Institute',
		validFrom: '2023-06-15T00:00:00Z'
	};

	const longDescription: BadgeDetail = {
		...fullDetail,
		imageUrl: undefined,
		validUntil: undefined,
		description:
			'This credential recognizes sustained, expert-level practice across the full software delivery lifecycle. Holders have repeatedly designed resilient distributed systems, led incident response under pressure, mentored other engineers, and driven measurable reliability improvements across multiple production environments over an extended period of time.'
	};

	const warning: VerificationProblem = {
		check: 'registry.issuer',
		title: 'Issuer not in a trusted registry',
		detail: 'The issuer could not be found in a known trust registry.',
		fatal: false
	};
	const critical: VerificationProblem = {
		check: 'cryptographic.proof.signature',
		title: 'Invalid Signature',
		detail: 'The credential proof could not be cryptographically verified.',
		fatal: true
	};

	const { Story } = defineMeta({
		title: 'components/BadgeMetadata',
		component: BadgeMetadata,
		tags: ['autodocs']
	});
</script>

<Story name="Valid (full detail + image)">
	<div class="max-w-md">
		<BadgeMetadata name={fullDetail.achievementName ?? 'Badge'} detail={fullDetail} />
	</div>
</Story>

<Story name="Valid (no image, no expiry)">
	<div class="max-w-md">
		<BadgeMetadata name="SRE Professional" detail={minimalDetail} />
	</div>
</Story>

<Story name="Warning (collapsed disclosure)">
	<div class="max-w-md">
		<BadgeMetadata
			name={fullDetail.achievementName ?? 'Badge'}
			detail={fullDetail}
			problems={[warning]}
		/>
	</div>
</Story>

<Story name="Invalid (fatal problem)">
	<div class="max-w-md">
		<BadgeMetadata
			name={fullDetail.achievementName ?? 'Badge'}
			detail={fullDetail}
			problems={[critical, warning]}
		/>
	</div>
</Story>

<Story name="Long description">
	<div class="max-w-md">
		<BadgeMetadata name={longDescription.achievementName ?? 'Badge'} detail={longDescription} />
	</div>
</Story>

<Story name="Compact (assigned box variant)">
	<div class="max-w-sm">
		<BadgeMetadata
			compact
			name={fullDetail.achievementName ?? 'Badge'}
			detail={fullDetail}
			problems={[warning]}
		/>
	</div>
</Story>
