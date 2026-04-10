import { getAppVersion } from './app-version.js';

export function buildVersionBody(): {
	version: string;
	buildTimestamp?: string;
	buildTimestampPT?: string;
	extra: Record<string, string>;
} {
	const version =
		process.env.SKILLS_VERIFIER_VERSION?.trim() ||
		process.env.APP_VERSION?.trim() ||
		getAppVersion();

	const mono = process.env.SBS_MONOREPO_VERSION?.trim();
	const extra: Record<string, string> = {};
	if (mono) {
		extra.sbsMonorepoVersion = mono;
	}

	const body: {
		version: string;
		buildTimestamp?: string;
		buildTimestampPT?: string;
		extra: Record<string, string>;
	} = {
		version,
		extra
	};

	const bt = process.env.BUILD_TIMESTAMP?.trim();
	if (bt) body.buildTimestamp = bt;
	const btpt = process.env.BUILD_TIMESTAMP_PT?.trim();
	if (btpt) body.buildTimestampPT = btpt;

	return body;
}
