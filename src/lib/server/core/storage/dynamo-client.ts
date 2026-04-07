import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * Low-level DynamoDB client (region from env or default).
 */
export function createDynamoDbClient(): DynamoDBClient {
	const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
	return new DynamoDBClient({ region });
}
