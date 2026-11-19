export type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  /** Suggested filename, e.g. "proof-event-123.jpg". Extension will be preserved. */
  filename: string;
  /** Logical folder — e.g. "events/proofs", "incidents", "certificates". */
  folder: string;
};

export type UploadResult = {
  url: string;
  key: string;
  provider: "local" | "s3" | "cloudinary";
  mimeType: string;
  size: number;
};

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
