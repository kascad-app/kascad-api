import { Injectable } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";
import { ImageDto } from "@kascad-app/shared-types";
import { BusboyConfig } from "@fastify/busboy";
import { MultipartFile } from "@fastify/multipart";

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
    files: (
      options?: Omit<BusboyConfig, "headers">,
    ) => AsyncIterableIterator<MultipartFile>,
    userSlug: string,
  ): Promise<string[]> {
    const imagesToUpload = [];
    for await (const file of files()) {
      const chunks = [];
      for await (const chunk of file.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      imagesToUpload.push({
        filename: file.filename,
        mimetype: file.mimetype,
        fieldname: "image-" + Date.now(),
        buffer,
      });
    }

    let imagesUrl: string[] = [];
    if (imagesToUpload.length > 0) {
      for (const image of imagesToUpload) {
        const fileUrl: string = await this.uploadFileToGCP(image, userSlug);
        if (fileUrl) imagesUrl.push(fileUrl);
      }
    }

    return imagesUrl;
  }

  async uploadFileToGCP(file: any, userSlug: string): Promise<string> {
    try {
      const destination = `images/${userSlug}/${file.fieldname}.jpg`;
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

  // async uploadAvatar(imagePath: string, userSlug: string): Promise<void> {
  //   await this.storage
  //     .bucket(this.bucketName)
  //     .file(`avatar/${userSlug}`)
  //     .delete()
  //     .catch(() => {
  //       console.log(`⚠️ Aucun avatar à supprimer, on continue...`);
  //     });

  //   await this.storage.bucket(this.bucketName).upload(imagePath, {
  //     destination: `avatars/${userSlug}`,
  //     metadata: {
  //       contentType: "image/jpeg",
  //     },
  //   });
  //   console.log(`✅ Avatar uploadé !`);
  // }

  async deleteImage(image: ImageDto): Promise<void> {
    const match = image.url.match(/\/images\/.+/);
    const fileToDelete = match ? match[0] : image.url;
    await this.storage.bucket(this.bucketName).file(fileToDelete).delete();
    console.log(`✅ Image supprimée !`);
  }

  async;
}
