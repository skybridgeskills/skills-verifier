import { panic } from '$lib/server/util/panic.js';
import { providerCtxSafe } from '$lib/server/util/provider/provider-ctx.js';

export type LogFields = Record<string, unknown>;

/**
 * Structured logger (Pino-backed in production contexts; fake in tests).
 */
export interface LoggerService {
	debug(msg: string): void;
	debug(obj: LogFields, msg?: string): void;
	info(msg: string): void;
	info(obj: LogFields, msg?: string): void;
	warn(msg: string): void;
	warn(obj: LogFields, msg?: string): void;
	error(msg: string): void;
	error(obj: LogFields, msg?: string): void;
	child(bindings: LogFields): LoggerService;
}

export type LoggerServiceCtx = { logger: LoggerService };

/**
 * Logger from the current provider context (server-only).
 */
export function appLogger(): LoggerService {
	const logger = providerCtxSafe<LoggerServiceCtx>().logger;
	if (logger === undefined) {
		panic(
			'No logger in app context. Ensure RealLoggerServiceCtx / FakeLoggerServiceCtx runs before appLogger().'
		);
	}
	return logger;
}

/**
 * Logger when context may be absent (e.g. early boot). Prefer `appLogger()` in requests.
 */
export function appLoggerSafe(): LoggerService | undefined {
	return providerCtxSafe<LoggerServiceCtx>().logger;
}

/** @internal Tests — root fake logger may carry a hidden records buffer. */
export const FAKE_LOGGER_RECORDS = Symbol.for('skillsVerifier.fakeLoggerRecords');

export type FakeLogRecord = {
	level: 'debug' | 'info' | 'warn' | 'error';
	bindings: LogFields;
	msg: string;
	data?: LogFields;
};

export function readFakeLoggerRecords(logger: LoggerService): FakeLogRecord[] | undefined {
	const withSym = logger as LoggerService & { [FAKE_LOGGER_RECORDS]?: FakeLogRecord[] };
	return withSym[FAKE_LOGGER_RECORDS];
}
