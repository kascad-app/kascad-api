import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
} from "@nestjs/common";

import { Rider, RiderMe, updateRiderDto } from "@kascad-app/shared-types";

import { RidersService } from "../services/riders.service";

import { FastifyRequest } from "fastify";
import { Logged, OptionalLogged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { StorageService } from "src/shared/gcp/services/storage.service";

@Controller()
export class RidersController {
  constructor(
    private _ridersService: RidersService,
    private readonly _storageService: StorageService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @Logged()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":slug")
  @OptionalLogged()
  async getRider(
    @Param("slug") slugRider: string,
    @User() user?: RiderMe,
  ): Promise<Rider> {
    this.logger.log("User:", user.slug);
    if (user) {
      await this._ridersService.addViewEntry(user._id, slugRider);
    }
    return await this._ridersService.findBySlug(slugRider);
  }

  @Logged()
  @Put("me/update-info")
  async updateMe(@User() user: RiderMe, @Body() updateRider: updateRiderDto) {
    if (updateRider.images && updateRider.images.length > 0) {
      const imagesToDelete = updateRider.images.filter(
        (image) => image.isToDelete,
      );

      if (imagesToDelete.length > 0) {
        await this._ridersService.removeImages(user._id, imagesToDelete);

        for (const image of imagesToDelete) {
          await this._storageService.deleteImageFromGCP(user.type, image.url);
        }
      }
    }

    return this._ridersService.updateOne(user._id, updateRider);
  }

  @Logged()
  @Post("me/upload-images")
  async uploadFile(@User() user: RiderMe, @Req() req: FastifyRequest) {
    try {
      if (!req.isMultipart()) {
        return {
          success: false,
          message: "No files to upload",
        };
      }
      const imagesUrl = await this._ridersService.updateRiderImages(
        () => req.files(),
        user,
      );
      if (imagesUrl || imagesUrl.length > 0) {
        await this._ridersService.uploadImages(
          user._id,
          imagesUrl.map((url) => ({
            url,
            uploadDate: new Date(),
          })),
        );
      }

      return {
        success: true,
        message: "Files uploaded successfully",
      };
    } catch (error) {
      this.logger.error("Error uploading files:", error);
      throw new BadRequest("Failed to upload files");
    }
  }

  @Logged()
  @Post("me/upload-avatar")
  async uploadAvatar(@User() user: RiderMe, @Req() req: FastifyRequest) {
    try {
      if (!req.isMultipart()) {
        return {
          success: false,
          message: "No avatar file to upload",
        };
      }
      const imageUrl: string = await this._ridersService.updateRiderAvatar(
        () => req.file(),
        user,
      );
      await this._ridersService.updateAvatar(user._id, imageUrl);

      return {
        success: true,
        message: "Avatar updated successfully",
      };
    } catch (error) {
      this.logger.error("Error uploading files:", error);
      throw new BadRequest("Failed to upload files");
    }
  }
}
