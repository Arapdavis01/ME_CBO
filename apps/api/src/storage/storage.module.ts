import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { LocalStorageProvider } from "./local.provider";
import { CloudinaryStorageProvider } from "./cloudinary.provider";
import { S3StorageProvider } from "./s3.provider";

@Global()
@Module({
  providers: [
    LocalStorageProvider,
    CloudinaryStorageProvider,
    S3StorageProvider,
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
