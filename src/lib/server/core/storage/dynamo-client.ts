import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * Low-level DynamoDB client (explicit region, else env, else us-west-2 for staging parity).
 */
export function createDynamoDbClient(regionOverride?: string): DynamoDBClient {
	const region =
		regionOverride?.trim() ||
		process.env.AWS_REGION ||
		process.env.AWS_DEFAULT_REGION ||
		'us-west-2';
	return new DynamoDBClient({ region });
}
