import { S3Client } from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.service";

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
}
