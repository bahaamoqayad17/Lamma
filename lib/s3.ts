import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
export const s3Client = new S3Client({
	region: process.env.NEXT_PUBLIC_AWS_REGION!,
	credentials: {
		accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
	},
});

export const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;

export interface SignedUrlOptions {
	expiresIn?: number; // in seconds, default 3600 (1 hour)
	contentType?: string;
	contentDisposition?: string;
}

/**
 * Generate a signed URL for downloading/viewing an S3 object
 */
export async function getSignedDownloadUrl(
	key: string,
	options: SignedUrlOptions = {},
): Promise<string> {
	const { expiresIn = 3600 } = options;

	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ResponseContentDisposition: options.contentDisposition,
		ResponseContentType: options.contentType,
	});

	return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a signed URL for uploading to S3
 */
export async function getSignedUploadUrl(
	key: string,
	options: SignedUrlOptions = {},
): Promise<string> {
	const { expiresIn = 3600, contentType } = options;

	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType,
	});

	return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a signed URL for deleting an S3 object
 */
export async function getSignedDeleteUrl(
	key: string,
	options: SignedUrlOptions = {},
): Promise<string> {
	const { expiresIn = 3600 } = options;

	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate multiple signed URLs for an array of S3 keys
 */
export async function getSignedDownloadUrls(
	keys: string[],
	options: SignedUrlOptions = {},
): Promise<Record<string, string>> {
	const signedUrls: Record<string, string> = {};

	await Promise.all(
		keys.map(async (key) => {
			try {
				signedUrls[key] = await getSignedDownloadUrl(key, options);
			} catch (error) {
				console.error(`Failed to generate signed URL for key: ${key}`, error);
				signedUrls[key] = '';
			}
		}),
	);

	return signedUrls;
}

/**
 * Helper function to extract S3 key from a full S3 URL
 */
export function extractS3Key(s3Url: string): string {
	try {
		const url = new URL(s3Url);
		// Handle both path-style and virtual-hosted-style URLs
		if (url.hostname.includes(BUCKET_NAME)) {
			// Virtual-hosted-style: https://bucket-name.s3.region.amazonaws.com/key
			return url.pathname.substring(1); // Remove leading slash
		} else {
			// Path-style: https://s3.region.amazonaws.com/bucket-name/key
			const pathParts = url.pathname.split('/');
			return pathParts.slice(2).join('/'); // Remove /bucket-name/
		}
	} catch (error) {
		console.error('Invalid S3 URL:', s3Url);
		return s3Url; // Return as-is if not a valid URL
	}
}

/**
 * Check if a URL is an S3 URL that needs signing
 */
export function isS3Url(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname.includes('amazonaws.com') || urlObj.hostname.includes('s3');
	} catch {
		return false;
	}
}

/**
 * Generate signed URL with error handling
 */
export async function safeGetSignedUrl(
	key: string,
	options: SignedUrlOptions = {},
): Promise<string | null> {
	try {
		return await getSignedDownloadUrl(key, options);
	} catch (error) {
		console.error(`Failed to generate signed URL for key: ${key}`, error);
		return null;
	}
}
