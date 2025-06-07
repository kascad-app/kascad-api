import { Injectable } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";
import { ImageDto } from "@kascad-app/shared-types";

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
    images: ImageDto[],
    userSlug: string,
  ): Promise<ImageDto[]> {
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.fileToUpload) {
          const file = await this.uploadFileToGCP(image.fileToUpload, userSlug);
          image.url = file;
        } else if (image.isToDelete) {
          await this.deleteImage(image);
        }
      }
    }

    return images;
  }

  async uploadFileToGCP(
    file: Express.Multer.File,
    userSlug: string,
  ): Promise<string> {
    const destination = `images/${userSlug}/${file.originalname}`;
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

  async deleteImage(image: ImageDto): Promise<void> {
    const match = image.url.match(/\/images\/.+/);
    const fileToDelete = match ? match[0] : image.url;
    await this.storage.bucket(this.bucketName).file(fileToDelete).delete();
    console.log(`✅ Image supprimée !`);
  }

  async;
}
