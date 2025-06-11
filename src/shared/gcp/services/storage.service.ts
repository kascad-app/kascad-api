import { Injectable } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";
import { ImageDto, RiderMe } from "@kascad-app/shared-types";
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
        const fileUrl: string = await this.uploadFileToGCP(
          image,
          userSlug,
          false,
        );
        if (fileUrl) imagesUrl.push(fileUrl);
      }
    }

    return imagesUrl;
  }

  async updateRiderAvatar(
    file: (options?: Omit<BusboyConfig, "headers">) => Promise<MultipartFile>,
    user: RiderMe,
  ): Promise<string> {
    const avatarFile = await file();
    if (!avatarFile) {
      throw new Error("No avatar file provided");
    }
    if (
      user.avatarUrl != null &&
      user.avatarUrl != undefined &&
      user.avatarUrl !== ""
    ) {
      await this.deleteAvatar(user.identifier.slug);
    }

    const chunks = [];
    for await (const chunk of avatarFile.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const image = {
      filename: avatarFile.filename,
      mimetype: avatarFile.mimetype,
      fieldname: "avatar-" + user.identifier.slug,
      buffer,
    };

    const fileUrl: string = await this.uploadFileToGCP(
      image,
      user.identifier.slug,
      true,
    );

    return fileUrl;
  }

  async uploadFileToGCP(
    file: any,
    userSlug: string,
    isAvatar: boolean,
  ): Promise<string> {
    try {
      const destination = isAvatar
        ? `avatars/${file.fieldname}`
        : `images/${userSlug}/${file.fieldname}`;
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

  async deleteAvatar(userSlug: string): Promise<void> {
    const fileToDelete = `avatars/avatar-${userSlug}`;
    await this.storage.bucket(this.bucketName).file(fileToDelete).delete();
    console.log(`✅ Avatar supprimé !`);
  }

  async;
}
