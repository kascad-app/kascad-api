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

  async updateRiderImages(
    imagePaths: string[],
    userSlug: string,
  ): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const [files] = await bucket.getFiles({ prefix: `images/${userSlug}/` });
    const existingFileNames = files.map((file) =>
      file.name.replace(`images/${userSlug}/`, ""),
    );

    // Delete files in GCP that are not in imagePaths
    for (const file of files) {
      const fileName = file.name.replace(`images/${userSlug}/`, "");
      if (!imagePaths.includes(fileName)) {
        await file.delete();
        console.log(`🗑️ Image supprimée de GCP: ${file.name}`);
      }
    }

    // Filter imagePaths to only those not already in GCP
    const filesToUpload = imagePaths.filter((path) => {
      const fileName = path.split(/[\\/]/).pop()!;
      return !existingFileNames.includes(fileName);
    });

    for (const file of filesToUpload) {
      await this.storage.bucket(this.bucketName).upload(file, {
        destination: `images/${userSlug}/`,
        metadata: {
          contentType: "image/jpeg",
        },
      });
    }
  }

  async uploadAvatar(imagePath: string, userSlug: string): Promise<void> {
    await this.storage
      .bucket(this.bucketName)
      .file(`avatar/${userSlug}`)
      .delete()
      .catch(() => {
        console.log(`⚠️ Aucun avatar à supprimer, on continue...`);
      });

    await this.storage.bucket(this.bucketName).upload(imagePath, {
      destination: `avatars/${userSlug}`,
      metadata: {
        contentType: "image/jpeg",
      },
    });
    console.log(`✅ Avatar uploadé !`);
  }

  async deleteImage(imagePath: string): Promise<void> {
    await this.storage.bucket(this.bucketName).file(imagePath).delete();
    console.log(`✅ Image supprimée !`);
  }

  async;
}
