import { Body, Controller, Get, Param, Post, Put, Req } from "@nestjs/common";

import { Rider, RiderMe, updateRiderDto } from "@kascad-app/shared-types";

import { RidersService } from "../services/riders.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { FastifyRequest } from "fastify";
import { StorageService } from "src/shared/gcp/services/storage.service";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@Controller()
export class RidersController {
  constructor(
    private _ridersService: RidersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @Logged()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":slug")
  @Logged()
  async getRider(
    @Param("slug") slugRider: string,
    @User() user: RiderMe,
  ): Promise<Rider> {
    await this._ridersService.addViewEntry(user._id, slugRider);
    return await this._ridersService.findBySlug(slugRider);
  }

  @Logged()
  @Put("me/update-info")
  async updateMe(
    @User() user: RiderMe,
    @Body() updateRider: updateRiderDto,
  ): Promise<Rider> {
    return this._ridersService.updateOne(user._id, updateRider);
  }

  @Logged()
  @Post("me/upload-images")
  async uploadFile(@User() user: RiderMe, @Req() req: FastifyRequest) {
    try {
      const imagesUrl = await this.storageService.updateRiderImages(
        () => req.files(),
        user.identifier.slug,
      );

      if (imagesUrl || imagesUrl.length > 0) {
        await this._ridersService.updateImages(
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
      console.error("Error uploading files:", error);
      throw new BadRequest("Failed to upload files");
    }
  }

  @Logged()
  @Post("me/upload-avatar")
  async uploadAvatar(@User() user: RiderMe, @Req() req: FastifyRequest) {
    try {
      const imageUrl = await this.storageService.updateRiderAvatar(
        () => req.file(),
        user,
      );
      console.log("Image URL:", imageUrl);
      if (imageUrl) {
        await this._ridersService.updateAvatar(user._id, imageUrl);
      }

      return {
        success: true,
        message: "Files uploaded successfully",
      };
    } catch (error) {
      console.error("Error uploading files:", error);
      throw new BadRequest("Failed to upload files");
    }
  }
}
