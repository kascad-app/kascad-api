import { Injectable } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_BUCKET_CREDENTIALS_JSON,
    });
    this.bucketName = process.env.GCP_BUCKET_IMAGES;
  }

  async uploadImage(localPath: string, userSlug: string): Promise<void> {
    await this.storage.bucket(this.bucketName).upload(localPath, {
      destination: "images" + userSlug,
      metadata: {
        contentType: "image/jpeg",
      },
    });
    console.log(`✅ Image uploadée !`);
  }

  async deleteImage(imagePath: string): Promise<void> {
    await this.storage.bucket(this.bucketName).file(imagePath).delete();
    console.log(`✅ Image supprimée !`);
  }
}
