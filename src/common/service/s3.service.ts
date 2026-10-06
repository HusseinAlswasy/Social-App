import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.service";
import { randomUUID } from "node:crypto";
import { storeEnum } from "../enums/multer_enum.js";
import fs from "fs";
import AppError from "../middleware/globalErrorHandel.middleware.js";
import { Upload } from "@aws-sdk/lib-storage";

export class s3Service {
  private readonly client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: AWS_REGION!,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  async uploadFile({
    ACL = ObjectCannedACL.private,
    path,
    file,
    store_type = storeEnum.memory,
  }: {
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
    store_type?: storeEnum;
  }) {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      ACL,
      Key: `Social_Media_App/${path}/${randomUUID()}__${file.originalname}`,
      Body:
        store_type == storeEnum.memory
          ? file.buffer
          : fs.createReadStream(file.path),
      ContentType: file.mimetype,
    });
    try {
      await this.client.send(command);
    } catch (error) {
      throw new AppError("Failed to upload file");
    }

    return command.input.Key;
  }
  async uploadLargeFile({
    ACL = ObjectCannedACL.private,
    path,
    file,
    store_type = storeEnum.memory,
  }: {
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
    store_type?: storeEnum;
  }) {
    const command = new Upload({
      client: this.client,
      params: {
        Bucket: AWS_BUCKET_NAME,
        ACL,
        Key: `Social_Media_App/${path}/${randomUUID()}__${file.originalname}`,
        Body:
          store_type == storeEnum.memory
            ? file.buffer
            : fs.createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    try {
      const result = await command.done();
      return result.Key;
    } catch (error) {
      throw new AppError("Failed to upload file");
    }
  }
  async uploadFiles({
    ACL = ObjectCannedACL.private,
    path = "General",
    files,
    store_type = storeEnum.memory,
    isLarge = false,
  }: {
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
    store_type?: storeEnum;
    isLarge?: boolean;
  }): Promise<string[]> {
    const upload = isLarge ? this.uploadLargeFile : this.uploadFile;
    const keys = await Promise.all(
      files.map((file) => upload.call(this, { path, file, store_type, ACL })),
    );
    return keys as string[];
  }
}
