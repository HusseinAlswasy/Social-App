import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

export class NotificationService {
  constructor() {
    if (!getApps().length) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : resolve(process.cwd(), "src/config/serviceAccountKey.json");

      if (!serviceAccountJson && !existsSync(serviceAccountPath)) {
        throw new Error(
          "Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
        );
      }

      const serviceAccount = serviceAccountJson
        ? JSON.parse(serviceAccountJson)
        : JSON.parse(readFileSync(serviceAccountPath, "utf8"));

      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  sendToDevice = async ({
    token,
    title,
    body,
  }: {
    token: string;
    title: string;
    body: string;
  }) => {
    return getMessaging().send({
      token,
      notification: { title, body },
    });
  };
}
