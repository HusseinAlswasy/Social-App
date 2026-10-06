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
}
