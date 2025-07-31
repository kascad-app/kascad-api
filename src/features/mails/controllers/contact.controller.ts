import { ResendService } from "nestjs-resend";
import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ContactEmailDto } from "../interfaces/contact.interfaces";
import { SponsorMessageDocument } from "../schemas/sponsor-message.schema";
import { SponsorMessageService } from "../services/sponsor-message.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";
import { Sponsor } from "src/features/sponsors/schemas/sponsor.schema";

@ApiTags("Contact")
@ApiBearerAuth()
@Controller("contact")
@Logged()
export class ContactController {
  constructor(
    private readonly resendService: ResendService,
    private readonly sponsorMessageService: SponsorMessageService,
    private readonly logger: Logger,
  ) {}

  @Post("send-one")
  @ApiOperation({
    summary: "Send contact email",
    description: "Sends a contact email from sponsor to rider",
  })
  @ApiBody({ description: "Contact email data" })
  @ApiResponse({ status: 200, description: "Email sent successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Failed to send email" })
  async sendContactEmail(
    @Body(new ZodValidationPipe(ContactEmailDto)) body: ContactEmailDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id;

    if (!sponsorId) {
      throw new Error("Sponsor not authenticated");
    }

    let savedMessage: SponsorMessageDocument;

    try {
      savedMessage = await this.sponsorMessageService.saveSponsorMessage({
        sponsorId,
        riderId: body.riderId,
        subject: body.email.subject,
        message: body.email.message,
        senderEmail: "info@kascad.fr",
        recipientEmail: body.email.toEmail,
        senderName: body.email.name,
        recipientName: body.email.name,
      });
    } catch (error) {
      this.logger.error("Failed to save message to database:", error);
      throw new Error("Failed to save message. Email not sent.");
    }

    try {
      const message = await this.resendService.send({
        from: `${body.email.name} <info@kascad.fr>`,
        to: body.email.toEmail,
        subject: body.email.subject,
        html: `<p>${body.email.message}</p>`,
      });

      await this.sponsorMessageService.updateMessageStatus(
        savedMessage._id.toString(),
        "delivered",
      );

      return message;
    } catch (error) {
      this.logger.error("Failed to send email:", error);

      await this.sponsorMessageService.updateMessageStatus(
        savedMessage._id.toString(),
        "failed",
      );

      throw new Error(
        "Failed to send email. Message saved with failed status.",
      );
    }
  }

  @Get("sponsor-messages")
  @ApiOperation({
    summary: "Get sponsor messages",
    description: "Retrieves all messages sent by the authenticated sponsor",
  })
  @ApiResponse({ status: 200, description: "Messages retrieved successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getSponsorMessages(@User() user: Sponsor) {
    const sponsorId = user._id;

    if (!sponsorId) {
      throw new Error("Sponsor not authenticated");
    }

    return this.sponsorMessageService.getSponsorMessages(sponsorId);
  }
}
