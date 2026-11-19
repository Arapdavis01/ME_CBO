import { Injectable, Logger } from "@nestjs/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageProvider, UploadInput, UploadResult } from "./storage.interface";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly rootDir = process.env.STORAGE_LOCAL_DIR ?? "./uploads";
  private readonly baseUrl =
    process.env.STORAGE_PUBLIC_BASE_URL ?? "http://localhost:4000/uploads";

  async upload(input: UploadInput): Promise<UploadResult> {
    const ext = path.extname(input.filename).toLowerCase() || this.extFor(input.mimeType);
    const folder = path.join(this.rootDir, input.folder);
    await fs.mkdir(folder, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(folder, filename);
    await fs.writeFile(filePath, input.buffer);
    const key = `${input.folder}/${filename}`;
    this.logger.log(`Stored locally: ${key}`);
    return {
      url: `${this.baseUrl}/${key}`,
      key,
      provider: "local",
      mimeType: input.mimeType,
      size: input.buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.rootDir, key));
    } catch {
      /* ignore */
    }
  }

  private extFor(mime: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
    };
    return map[mime] ?? "";
  }
}
