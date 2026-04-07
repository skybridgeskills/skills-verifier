import pkg from '../../../../package.json' with { type: 'json' };

let cached: string | undefined;

/** `package.json` version (e.g. for correlating logs with a deploy). */
export function getAppVersion(): string {
	if (cached === undefined) {
		cached = typeof pkg.version === 'string' && pkg.version.length > 0 ? pkg.version : 'unknown';
	}
	return cached;
}
