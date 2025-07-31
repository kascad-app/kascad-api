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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { Rider, RiderMe, updateRiderDto } from "@kascad-app/shared-types";

import { RidersService } from "../services/riders.service";

import { FastifyRequest } from "fastify";
import { Logged, OptionalLogged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { StorageService } from "src/shared/gcp/services/storage.service";

@ApiTags("Riders")
@Controller()
export class RidersController {
  constructor(
    private _ridersService: RidersService,
    private readonly _storageService: StorageService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all riders",
    description: "Retrieves a list of all riders",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "List of riders retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":slug")
  @ApiOperation({
    summary: "Get rider by slug",
    description:
      "Retrieves a specific rider by their slug and optionally tracks view",
  })
  @ApiParam({ name: "slug", type: String, description: "Rider slug" })
  @ApiResponse({ status: 200, description: "Rider retrieved successfully" })
  @ApiResponse({ status: 404, description: "Rider not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @OptionalLogged()
  async getRider(
    @Param("slug") slugRider: string,
    @User() user?: RiderMe,
  ): Promise<Rider> {
    this.logger.log("User:", user);
    if (user) {
      await this._ridersService.addViewEntry(user._id, slugRider);
    }
    return await this._ridersService.findBySlug(slugRider);
  }

  @Put("me/update-info")
  @ApiOperation({
    summary: "Update rider profile",
    description: "Updates the authenticated rider profile information",
  })
  @ApiBearerAuth()
  @ApiBody({ description: "Rider update data" })
  @ApiResponse({
    status: 200,
    description: "Rider profile updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
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

  @Post("me/upload-images")
  @ApiOperation({
    summary: "Upload rider images",
    description: "Uploads multiple images to the authenticated rider profile",
  })
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Images uploaded successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid file format or no files provided",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
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

  @Post("me/upload-avatar")
  @ApiOperation({
    summary: "Upload rider avatar",
    description: "Uploads a new avatar image for the authenticated rider",
  })
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Avatar uploaded successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid file format or no file provided",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
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
