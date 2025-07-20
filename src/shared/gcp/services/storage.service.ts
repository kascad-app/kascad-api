import { Injectable } from "@nestjs/common";

import { Storage } from "@google-cloud/storage";
import { RiderMe, Sponsor } from "@kascad-app/shared-types";

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    const credentialsBase64 = process.env.GCP_BUCKET_CREDENTIALS_BASE64;
    const credentials = credentialsBase64
      ? JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"))
      : undefined;

    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials,
    });
    this.bucketName = process.env.GCP_BUCKET_IMAGES;
  }

  async uploadFileToGCP(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any,
    user: RiderMe | Sponsor,
    isAvatar: boolean,
  ): Promise<string> {
    try {
      let destination = "";
      if (user.type === "sponsor") {
        const sponsor = user as Sponsor;
        destination = isAvatar
          ? `sponsor/avatars/${sponsor.identity.companyName}/${file.fieldname}`
          : `sponsor/images/${sponsor.identity.companyName}/${file.fieldname}`;
      } else {
        const rider = user as RiderMe;
        destination = isAvatar
          ? `rider/avatars/${rider.identifier.slug}/${file.fieldname}`
          : `rider/images/${rider.identifier.slug}/${file.fieldname}`;
      }
      const bucket = this.storage.bucket(this.bucketName);

      const blob = bucket.file(destination);
      const stream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      return new Promise<string>((resolve, reject) => {
        stream.on("error", (err) => reject(err));
        stream.on("finish", () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destination}`;
          resolve(publicUrl);
        });
        stream.end(file.buffer);
      });
    } catch (error) {
      console.error("Error uploading file to GCP:", error);
      throw new Error("Failed to upload file to GCP");
    }
  }

  async deleteImageFromGCP(userType: string, imageUrl: string): Promise<void> {
    const regex =
      userType == "sponsor"
        ? imageUrl.match(/(sponsor\/images\/.+)$/)
        : imageUrl.match(/(rider\/images\/.+)$/);
    const fileToDelete = regex ? regex[1] : null;
    try {
      await this.storage.bucket(this.bucketName).file(fileToDelete).delete();
      console.log("✅ Image supprimée !");
    } catch (error) {
      // On ignore l'erreur si le fichier n'existe pas ou autre
      console.warn(
        `⚠️ Impossible de supprimer l'image (${fileToDelete}) :`,
        error.message,
      );
    }
  }

  async deleteAvatar(userType: string, imageUrl: string): Promise<void> {
    const regex =
      userType == "sponsor"
        ? imageUrl.match(/(sponsor\/avatars\/.+)$/)
        : imageUrl.match(/(rider\/avatars\/.+)$/);
    const fileToDelete = regex ? regex[1] : null;
    try {
      await this.storage.bucket(this.bucketName).file(fileToDelete).delete();
      console.log("✅ Avatar supprimé !");
    } catch (error) {
      // On ignore l'erreur si le fichier n'existe pas ou autre
      console.warn(
        `⚠️ Impossible de supprimer l'avatar (${fileToDelete}) :`,
        error.message,
      );
    }
  }
}
