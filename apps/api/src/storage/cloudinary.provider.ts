import { Injectable, Logger } from "@nestjs/common";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { StorageProvider, UploadInput, UploadResult } from "./storage.interface";

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);
  private readonly rootFolder = process.env.CLOUDINARY_FOLDER ?? "me-cbo";

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const res = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.rootFolder}/${input.folder}`,
          resource_type: "auto",
          public_id: input.filename.replace(/\.[^.]+$/, ""),
        },
        (err, result) => {
          if (err || !result) reject(err ?? new Error("Upload failed"));
          else resolve(result);
        },
      );
      stream.end(input.buffer);
    });

    this.logger.log(`Uploaded to Cloudinary: ${res.public_id}`);
    return {
      url: res.secure_url,
      key: res.public_id,
      provider: "cloudinary",
      mimeType: input.mimeType,
      size: input.buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key, { resource_type: "auto", invalidate: true });
    } catch {
      /* ignore */
    }
  }
}
