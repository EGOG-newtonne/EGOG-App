import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { PublicAssetInput } from "./public-assets";

interface S3BackupConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function createS3BackupWriter(config: S3BackupConfig) {
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return async (input: PublicAssetInput) => {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: input.backupKey,
        Body: input.bytes,
        ContentType: input.contentType,
      }),
    );
  };
}
