/** Core */
export { defineQuery } from './define-query.js';
export { createDynamoDbClient } from './dynamo-client.js';
export { MemoryDatabase } from './memory-database.js';
export { createStorageDatabase } from './storage-database-factory.js';
export {
	isDynamoDatabase,
	isMemoryDatabase,
	type DynamoStorageDatabase,
	type StorageDatabase
} from './types.js';
export {
	AppResource,
	AppResourceFields,
	type AppResource as AppResourceType
} from './app-resource.js';
export { AppRow, AppRowFields, type AppRow as AppRowType } from './app-row.js';
export { StorageDatabaseCtx } from './storage-database-ctx.js';

/** Job Domain */
export {
	FrameworkResource,
	SkillResource,
	JobStatus,
	JobResource,
	CreateJobParams,
	type FrameworkResource as FrameworkResourceType,
	type SkillResource as SkillResourceType,
	type JobStatus as JobStatusType,
	type JobResource as JobResourceType,
	type CreateJobParams as CreateJobParamsType
} from '../../domain/job/job-resource.js';

/** Job Row (Database Layer) */
export {
	JobRow,
	jobMetaKeys,
	jobToRow,
	rowToJobResource,
	parseJobRow,
	type JobRow as JobRowType
} from '../../domain/job/job-row.js';

/** Job Queries */
export { createJobQuery } from '../../domain/job/create-job-query.js';
export { jobByIdQuery } from '../../domain/job/job-by-id-query.js';
export { jobByExternalIdQuery } from '../../domain/job/job-by-external-id-query.js';
export { listActiveJobsQuery } from '../../domain/job/list-active-jobs-query.js';

/** Job app domain */
export {
	JobAppStatus,
	JobAppResource,
	CreateJobAppParams,
	type JobAppStatus as JobAppStatusType,
	type JobAppResource as JobAppResourceType,
	type CreateJobAppParams as CreateJobAppParamsType
} from '../../domain/job-app/job-app-resource.js';

/** Job app row (database layer) */
export {
	JobAppRow,
	jobAppMetaKeys,
	jobAppToRow,
	rowToJobAppResource,
	parseJobAppRow,
	type JobAppRow as JobAppRowType
} from '../../domain/job-app/job-app-row.js';

/** Job app queries */
export { createJobAppQuery } from '../../domain/job-app/create-job-app-query.js';
export { jobAppByIdQuery } from '../../domain/job-app/job-app-by-id-query.js';
export { listJobAppsByJobQuery } from '../../domain/job-app/list-job-apps-by-job-query.js';

/** Match domain */
export {
	MatchExchangeState,
	VerifiedCredential,
	MatchAssignment,
	MatchResource,
	CreateMatchParams,
	UpdateMatchExchangeParams,
	SaveAssignmentsParams,
	type MatchExchangeState as MatchExchangeStateType,
	type VerifiedCredential as VerifiedCredentialType,
	type MatchAssignment as MatchAssignmentType,
	type MatchResource as MatchResourceType,
	type CreateMatchParams as CreateMatchParamsType,
	type UpdateMatchExchangeParams as UpdateMatchExchangeParamsType,
	type SaveAssignmentsParams as SaveAssignmentsParamsType
} from '../../domain/match/match-resource.js';

/** Match row (database layer) */
export {
	MatchRow,
	matchMetaKeys,
	matchToRow,
	rowToMatchResource,
	parseMatchRow,
	type MatchRow as MatchRowType
} from '../../domain/match/match-row.js';

/** Match queries */
export { createMatchQuery } from '../../domain/match/create-match-query.js';
export { matchByIdQuery } from '../../domain/match/match-by-id-query.js';
export { listMatchesByJobQuery } from '../../domain/match/list-matches-by-job-query.js';
export { saveMatchCredentialsQuery } from '../../domain/match/save-match-credentials-query.js';
export { saveMatchAssignmentsQuery } from '../../domain/match/save-match-assignments-query.js';
