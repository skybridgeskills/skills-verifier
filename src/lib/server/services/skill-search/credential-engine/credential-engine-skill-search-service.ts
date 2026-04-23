import { HttpHealthCheck } from '$lib/server/health/checks/http-health-check.js';
import { HealthCheckSym, type HealthCheck } from '$lib/server/health/health-check.js';
import { appLoggerSafe } from '$lib/server/services/logging/logger-service.js';

import type {
	RegistryContainerSearchResult,
	RegistryFrameworkSearchResult,
	SkillSearchQuery,
	SkillSearchResult,
	SkillSearchService
} from '../skill-search-service.js';

import {
	buildCredentialEngineContainerSearchRequest,
	buildCredentialEngineFrameworkSearchRequest,
	buildCredentialEngineSearchRequest
} from './credential-engine-search-request.js';
import {
	mapCredentialEngineContainerSearchResponse,
	mapCredentialEngineFrameworkSearchResponse
} from './map-credential-engine-registry-search-response.js';
import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';

export interface CredentialEngineSkillSearchConfig {
	searchUrl: string;
	apiKey: string;
}

/** Credential Registry Search API client (server-only). */
async function postCredentialEngineSearch(
	config: CredentialEngineSkillSearchConfig,
	requestBody: unknown,
	logLabel: string
): Promise<unknown> {
	const log = appLoggerSafe();
	if (log) {
		log.debug({ requestBody, searchUrl: config.searchUrl }, logLabel);
	}

	const response = await fetch(config.searchUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`
		},
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => 'Unable to read error body');
		if (log) {
			log.debug({ status: response.status, errorBody }, 'CE search error response');
		}
		throw new Error(`CE search failed: ${response.status} ${response.statusText} - ${errorBody}`);
	}

	return response.json();
}

function ceBaseUrl(searchUrl: string): string {
	try {
		return new URL(searchUrl).origin;
	} catch {
		return searchUrl.replace(/\/assistant\/search.*$/, '').replace(/\/$/, '') || 'invalid-url';
	}
}

export type CredentialEngineSkillSearchServiceWithHealth = SkillSearchService & {
	[HealthCheckSym]: HealthCheck;
};

export function CredentialEngineSkillSearchService(
	config: CredentialEngineSkillSearchConfig
): CredentialEngineSkillSearchServiceWithHealth {
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const requestBody = buildCredentialEngineSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(config, requestBody, 'CE skill search');
			return mapCredentialEngineSearchResponse(ceResponse);
		},

		async searchContainers(query: SkillSearchQuery): Promise<RegistryContainerSearchResult[]> {
			const requestBody = buildCredentialEngineContainerSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(
				config,
				requestBody,
				'CE container search'
			);
			return mapCredentialEngineContainerSearchResponse(ceResponse);
		},

		async searchFrameworks(query: SkillSearchQuery): Promise<RegistryFrameworkSearchResult[]> {
			const requestBody = buildCredentialEngineFrameworkSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(
				config,
				requestBody,
				'CE framework search'
			);
			return mapCredentialEngineFrameworkSearchResponse(ceResponse);
		},

		[HealthCheckSym]: HttpHealthCheck({
			name: 'credential-engine',
			baseUrl: ceBaseUrl(config.searchUrl),
			path: '/health',
			apiKey: config.apiKey
		})
	};
}
