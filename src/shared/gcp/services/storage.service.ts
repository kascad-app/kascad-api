import { Injectable } from "@nestjs/common";
import { Storage, TransferManager } from "@google-cloud/storage";
import { ImageDto } from "@kascad-app/shared-types";
import { Express } from "express";

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

  async updateRiderImages(images: ImageDto[], userSlug: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const transferManager = new TransferManager(bucket);

    if (images && images.length > 0) {
      const imagesToUpload = images.filter((image) => image.fileToUpload);
      const imagesToDelete = images.filter((image) => image.isToDelete);

      // for (const image of imagesToUpload) {
      //   await this.storage.bucket(this.bucketName).upload(image.fileToUpload, {
      //     destination: `images/${userSlug}/`,
      //     metadata: {
      //       contentType: "image/jpeg",
      //     },
      //   });
      // }

      for (const image of imagesToDelete) {
        if (image) {
          await this.deleteImage(image);
        }
      }
    }
  }

  // async uploadFileToGCP(file: File, userSlug: string): Promise<string> {
  //   const destination = `images/${userSlug}/${file.name}`;
  //   const bucket = this.storage.bucket(this.bucketName);

  //   // Upload depuis le buffer
  //   const blob = bucket.file(destination);
  //   const stream = blob.createWriteStream({
  //     metadata: {
  //       contentType: file.type,
  //     },
  //   });

  //   return new Promise<string>((resolve, reject) => {
  //     stream.on("error", (err) => reject(err));
  //     stream.on("finish", () => {
  //       // URL publique (si le bucket est public)
  //       const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destination}`;
  //       resolve(publicUrl);
  //     });
  //     stream.end(file.buffer);
  //   });
  // }

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
