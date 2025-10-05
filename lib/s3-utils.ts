import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from './s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
	key: string;
	url: string;
	publicUrl: string;
}

export interface MultipleUploadResult {
	success: boolean;
	urls: string[];
	publicUrls: string[];
	keys: string[];
	errors: string[];
}

/**
 * Check if error is a time skew error and provide helpful message
 */
function handleS3Error(error: unknown, fileName?: string): Error {
	const errorObj = error as any;
	if (errorObj.Code === 'RequestTimeTooSkewed' || errorObj.name === 'RequestTimeTooSkewed') {
		return new Error(
			`AWS Time Sync Error${fileName ? ` for ${fileName}` : ''}: Your system clock is out of sync with AWS servers. ` +
				`Please synchronize your system time. On Windows: Settings > Time & Language > Date & Time > Sync now. ` +
				`Or try running 'w32tm /resync' as administrator in Command Prompt.`,
		);
	}

	if (errorObj.message?.includes('RequestTimeTooSkewed')) {
		return new Error(
			`Time synchronization error${fileName ? ` for ${fileName}` : ''}: ` +
				`System time is too far from AWS server time. Please sync your system clock and try again.`,
		);
	}

	return new Error(
		`Upload failed${fileName ? ` for ${fileName}` : ''}: ${errorObj.message || 'Unknown error'}`,
	);
}

/**
 * Upload a file to S3 with public read access
 */
export async function uploadFileToS3(
	file: Buffer,
	fileName: string,
	contentType: string,
	folder?: string,
): Promise<UploadResult> {
	const key = `${folder ? folder + '/' : ''}${uuidv4()}-${fileName}`;

	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		Body: file,
		ContentType: contentType,
		ACL: 'public-read', // Make file publicly accessible
	});

	try {
		await s3Client.send(command);

		// Generate public URL with correct regional format
		const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

		// Generate signed URL (expires in 1 hour) - kept for backward compatibility
		await getSignedUrl(
			s3Client,
			new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key,
			}),
			{ expiresIn: 3600 },
		);

		return {
			key,
			url: publicUrl, // Return public URL as main URL
			publicUrl,
		};
	} catch (error) {
		console.error('Error uploading file to S3:', error);
		throw handleS3Error(error, fileName);
	}
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleFilesToS3(
	files: File[],
	folder?: string,
): Promise<MultipleUploadResult> {
	const results: MultipleUploadResult = {
		success: true,
		urls: [],
		publicUrls: [],
		keys: [],
		errors: [],
	};

	// Process files in parallel but limit concurrency to avoid overwhelming S3
	const uploadPromises = files.map(async (file) => {
		try {
			// Convert File to Buffer
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Generate sanitized filename
			const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

			const uploadResult = await uploadFileToS3(buffer, sanitizedFileName, file.type, folder);

			return {
				success: true,
				result: uploadResult,
				fileName: file.name,
			};
		} catch (error) {
			console.error(`Error uploading file ${file.name}:`, error);
			return {
				success: false,
				error: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
				fileName: file.name,
			};
		}
	});

	const uploadResults = await Promise.all(uploadPromises);

	// Process results
	uploadResults.forEach((result) => {
		if (result.success && 'result' in result && result.result) {
			results.urls.push(result.result.publicUrl); // Use public URL as main URL
			results.publicUrls.push(result.result.publicUrl);
			results.keys.push(result.result.key);
		} else if (!result.success && 'error' in result && result.error) {
			results.errors.push(result.error);
			results.success = false;
		}
	});

	return results;
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	try {
		await s3Client.send(command);
	} catch (error) {
		console.error('Error deleting file from S3:', error);
		throw new Error('Failed to delete file from S3');
	}
}

/**
 * Delete multiple files from S3
 */
export async function deleteMultipleFilesFromS3(keys: string[]): Promise<void> {
	const deletePromises = keys.map((key) => deleteFileFromS3(key));
	await Promise.all(deletePromises);
}

/**
 * Generate a signed URL for a file
 */
export async function getSignedUrlForFile(key: string, expiresIn: number = 3600): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	try {
		const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
		return signedUrl;
	} catch (error) {
		console.error('Error generating signed URL:', error);
		throw new Error('Failed to generate signed URL');
	}
}

export function getFilenameFromUrl(url: string): string {
	try {
		// Extract filename from URL path
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const segments = pathname.split('/');
		const filename = segments[segments.length - 1];

		// Remove UUID prefix if present (format: uuid-filename)
		const cleanFilename = filename.replace(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/,
			'',
		);

		return decodeURIComponent(cleanFilename) || 'download';
	} catch (error) {
		console.error('Error parsing filename:', error);
		return 'download';
	}
}
