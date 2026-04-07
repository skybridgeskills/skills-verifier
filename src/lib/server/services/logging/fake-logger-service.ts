import { getAppVersion } from '../../util/app-version.js';

import {
	FAKE_LOGGER_RECORDS,
	type FakeLogRecord,
	type LoggerService,
	type LogFields
} from './logger-service.js';

type Level = FakeLogRecord['level'];

export function FakeLoggerService(): LoggerService {
	const records: FakeLogRecord[] = [];

	function push(level: Level, bindings: LogFields, first: string | LogFields, second?: string) {
		if (typeof first === 'string') {
			records.push({ level, bindings: { ...bindings }, msg: first });
		} else {
			const msgText =
				typeof second === 'string' && second.length > 0
					? second
					: typeof first.msg === 'string'
						? first.msg
						: '';
			const { msg: _m, ...rest } = first;
			const data = rest as LogFields;
			records.push({
				level,
				bindings: { ...bindings },
				msg: msgText,
				data: Object.keys(data).length > 0 ? data : undefined
			});
		}
	}

	function node(bindings: LogFields): LoggerService {
		return {
			debug(first: string | LogFields, second?: string) {
				push('debug', bindings, first as never, second);
			},
			info(first: string | LogFields, second?: string) {
				push('info', bindings, first as never, second);
			},
			warn(first: string | LogFields, second?: string) {
				push('warn', bindings, first as never, second);
			},
			error(first: string | LogFields, second?: string) {
				push('error', bindings, first as never, second);
			},
			child(extra: LogFields) {
				return node({ ...bindings, ...extra });
			}
		};
	}

	const root = node({});
	Object.defineProperty(root, FAKE_LOGGER_RECORDS, {
		value: records,
		enumerable: false,
		configurable: false,
		writable: false
	});
	return root;
}

export function FakeLoggerServiceCtx() {
	return () => {
		const logger = FakeLoggerService();
		logger.info(
			{ appVersion: getAppVersion(), service: 'logger', implementation: 'fake' },
			'service initialized'
		);
		return { logger };
	};
}

export type FakeLoggerServiceCtx = ReturnType<typeof FakeLoggerServiceCtx>;
