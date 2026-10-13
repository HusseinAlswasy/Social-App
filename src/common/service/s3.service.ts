import {
  DeleteObject$,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
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
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  //============================== Upload File ==============================
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

  //============================== Upload Large File ==============================
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
  //============================== Upload Multiple Files ==============================
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
  //============================== Get File ==============================
  async getFiles(Key: string) {
    const command = new GetObjectCommand({
      Key,
      Bucket: AWS_BUCKET_NAME,
    });

    return await this.client.send(command);
  }
  //============================== Create Link to Upload File ==============================
  async createPreSignedUrl({
    path,
    fileName,
    ContentType,
    expiresIn = 60 * 2,
  }: {
    path: string;
    fileName: string;
    ContentType: string;
    expiresIn?: number;
  }) {
    const Key = `Social_Media_App/${path}/${randomUUID()}__${fileName}`;
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: Key,
      ContentType,
    });
    try {
      const url = await getSignedUrl(this.client, command, {
        expiresIn: expiresIn,
      });
      return { url, Key };
    } catch (error) {
      throw new AppError("Failed to upload file");
    }
  }

  //============================== Create Link to Download File ==============================

  async getPreSignedUrl({
    Key,
    expiresIn = 60 * 2,
    download = "true",
  }: {
    Key: string;
    expiresIn?: number;
    download: string | undefined;
  }) {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: Key,
      ResponseContentDisposition: download
        ? `attachment; filename="${Key.split("/").pop()}"`
        : undefined,
    });
    try {
      const url = await getSignedUrl(this.client, command, {
        expiresIn: expiresIn,
      });
      return { url, Key };
    } catch (error) {
      throw new AppError("Failed to Get file");
    }
  }

  //============================== Get All Files in Folder ==============================

  async getAllFiles(folderName: string) {
    const command = new ListObjectsV2Command({
      Bucket: AWS_BUCKET_NAME,
      Prefix: `Social_Media_App/${folderName}/`,
    });

    return await this.client.send(command);
  }

  //============================== Delete File ==============================
  async deleteFile(Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
    });

    return await this.client.send(command);
  }

  //============================== Delete Multiple Files ==============================
  async deleteFiles(Keys: string[]) {
    const KeysMapped = Keys.map((K) => {
      return { Key: K };
    });
    const command = new DeleteObjectsCommand({
      Bucket: AWS_BUCKET_NAME,
      Delete: {
        Objects: KeysMapped,
      },
    });
    return await this.client.send(command);
  }

  //============================= Delete Folder =====================================
  async deleteFolder(folderName: string) {
    const { Contents } = await this.getAllFiles(folderName);

    if (!Contents || Contents.length === 0) {
      throw new AppError("Folder is empty or does not exist");
    }

    const Keys = Contents.map((file) => file.Key!);

    await this.deleteFiles(Keys);
  }
}
