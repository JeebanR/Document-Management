import fs from 'fs';
import { logger } from '../config/logger';

interface UploadFileInfo {
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
}

export function isS3Enabled(): boolean {
  return (
    process.env.USE_S3 === 'true' &&
    !!process.env.AWS_ACCESS_KEY_ID &&
    !!process.env.AWS_SECRET_ACCESS_KEY &&
    !!process.env.AWS_S3_BUCKET
  );
}

/**
 * Uploads a file to S3 and returns the public URL.
 * Lazily imports @aws-sdk/client-s3 so the dependency is optional —
 * the app runs fine with local disk storage if S3 isn't configured.
 */
export async function uploadToS3(file: UploadFileInfo): Promise<string> {
  // Lazy require to avoid hard dependency when USE_S3=false
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const client = new S3Client({ region: process.env.AWS_REGION });
  const key = `documents/${file.filename}`;
  const fileBuffer = fs.readFileSync(file.path);

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
    }),
  );

  logger.info(`Uploaded to S3: ${key}`);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

  const client = new S3Client({ region: process.env.AWS_REGION });
  const key = fileUrl.split('.amazonaws.com/')[1];

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }),
  );

  logger.info(`Deleted from S3: ${key}`);
}
