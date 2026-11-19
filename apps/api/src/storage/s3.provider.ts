import { Injectable, Logger } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import * as path from "node:path";
import type { StorageProvider, UploadInput, UploadResult } from "./storage.interface";

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly client: S3Client;
  private readonly bucket = process.env.S3_BUCKET!;
  private readonly baseUrl = process.env.S3_PUBLIC_BASE_URL!;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "eu-west-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const ext = path.extname(input.filename) || "";
    const key = `${input.folder}/${randomUUID()}${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
        ACL: "public-read",
      }),
    );
    this.logger.log(`Uploaded to S3: ${key}`);
    return {
      url: `${this.baseUrl}/${key}`,
      key,
      provider: "s3",
      mimeType: input.mimeType,
      size: input.buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch {
      /* ignore */
    }
  }
}
