import { Injectable, Logger } from "@nestjs/common";
import { LocalStorageProvider } from "./local.provider";
import { CloudinaryStorageProvider } from "./cloudinary.provider";
import { S3StorageProvider } from "./s3.provider";
import type { StorageProvider, UploadInput, UploadResult } from "./storage.interface";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: StorageProvider;

  constructor(
    local: LocalStorageProvider,
    cloudinary: CloudinaryStorageProvider,
    s3: S3StorageProvider,
  ) {
    const which = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
    this.provider =
      which === "cloudinary" ? cloudinary : which === "s3" ? s3 : local;
    this.logger.log(`Storage provider: ${which}`);
  }

  upload(input: UploadInput): Promise<UploadResult> {
    return this.provider.upload(input);
  }

  delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }
}
