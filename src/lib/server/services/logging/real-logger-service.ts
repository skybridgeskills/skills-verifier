import pino, { type Logger as PinoLogger } from 'pino';
import pretty from 'pino-pretty';

import { getAppVersion } from '../../util/app-version.js';

import type { LoggerService, LogFields } from './logger-service.js';

export type RealLoggerConfig = {
	level: string;
	pretty: boolean;
};

export function RealLoggerService(config: RealLoggerConfig): LoggerService {
	const pinoLogger = config.pretty
		? pino({ level: config.level }, pretty({ colorize: true, translateTime: 'SYS:standard' }))
		: pino({ level: config.level });

	return wrapPino(pinoLogger);
}

function wrapPino(log: PinoLogger): LoggerService {
	return {
		debug(first: string | LogFields, second?: string) {
			if (typeof first === 'string') log.debug(first);
			else log.debug(first, second ?? '');
		},
		info(first: string | LogFields, second?: string) {
			if (typeof first === 'string') log.info(first);
			else log.info(first, second ?? '');
		},
		warn(first: string | LogFields, second?: string) {
			if (typeof first === 'string') log.warn(first);
			else log.warn(first, second ?? '');
		},
		error(first: string | LogFields, second?: string) {
			if (typeof first === 'string') log.error(first);
			else log.error(first, second ?? '');
		},
		child(bindings: LogFields) {
			return wrapPino(log.child(bindings));
		}
	};
}

export function RealLoggerServiceCtx(config: RealLoggerConfig) {
	return () => {
		const logger = RealLoggerService(config);
		logger.info(
			{
				appVersion: getAppVersion(),
				service: 'logger',
				implementation: config.pretty ? 'pino-pretty' : 'pino-json',
				level: config.level
			},
			'service initialized'
		);
		return { logger };
	};
}

export type RealLoggerServiceCtx = ReturnType<typeof RealLoggerServiceCtx>;
