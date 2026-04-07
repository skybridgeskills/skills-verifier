/** Core */
export { defineQuery } from './core/define-query.js';
export { createDynamoDbClient } from './core/dynamo-client.js';
export { MemoryDatabase } from './core/memory-database.js';
export { createStorageDatabase } from './core/storage-database-factory.js';
export {
	isDynamoDatabase,
	isMemoryDatabase,
	type DynamoStorageDatabase,
	type StorageDatabase
} from './core/types.js';
export {
	AppResource,
	AppResourceFields,
	type AppResource as AppResourceType
} from './core/app-resource.js';
export { AppRow, AppRowFields, type AppRow as AppRowType } from './core/app-row.js';
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
} from './job/job-resource.js';

/** Job Row (Database Layer) */
export {
	JobRow,
	jobMetaKeys,
	jobToRow,
	rowToJobResource,
	parseJobRow,
	type JobRow as JobRowType
} from './job/job-row.js';

/** Job Queries */
export { createJobQuery } from './job/create-job-query.js';
export { jobByIdQuery } from './job/job-by-id-query.js';
export { jobByExternalIdQuery } from './job/job-by-external-id-query.js';
export { listActiveJobsQuery } from './job/list-active-jobs-query.js';

/** Job app domain */
export {
	JobAppStatus,
	JobAppResource,
	CreateJobAppParams,
	type JobAppStatus as JobAppStatusType,
	type JobAppResource as JobAppResourceType,
	type CreateJobAppParams as CreateJobAppParamsType
} from './job-app/job-app-resource.js';

/** Job app row (database layer) */
export {
	JobAppRow,
	jobAppMetaKeys,
	jobAppToRow,
	rowToJobAppResource,
	parseJobAppRow,
	type JobAppRow as JobAppRowType
} from './job-app/job-app-row.js';

/** Job app queries */
export { createJobAppQuery } from './job-app/create-job-app-query.js';
export { jobAppByIdQuery } from './job-app/job-app-by-id-query.js';
export { listJobAppsByJobQuery } from './job-app/list-job-apps-by-job-query.js';
