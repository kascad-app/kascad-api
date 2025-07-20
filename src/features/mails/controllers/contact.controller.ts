import { ResendService } from "nestjs-resend";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ContactEmailDto } from "../interfaces/contact.interfaces";
import { SponsorMessageService } from "../services/sponsor-message.service";

import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";
import { Sponsor } from "src/features/sponsors/schemas/sponsor.schema";

@Controller("contact")
export class ContactController {
  constructor(
    private readonly resendService: ResendService,
    private readonly sponsorMessageService: SponsorMessageService,
  ) {}

  @Post("send-one")
  async sendContactEmail(
    @Body(new ZodValidationPipe(ContactEmailDto)) body: ContactEmailDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id;

    if (!sponsorId) {
      throw new Error("Sponsor not authenticated");
    }

    if (sponsorId) {
      await this.sponsorMessageService.saveSponsorMessage({
        sponsorId,
        riderId: body.riderId,
        subject: body.email.subject,
        message: body.email.message,
        senderEmail: "info@send.kascad.fr",
        recipientEmail: body.email.toEmail,
        senderName: body.email.name,
        recipientName: body.email.name,
      });
    }

    return this.resendService.send({
      from: `"${body.email.name}" <info@send.kascad.fr>`,
      to: body.email.toEmail,
      subject: body.email.subject,
      html: `<p>${body.email.message}</p>`,
    });
  }

  @Get("sponsor-messages/:sponsorId")
  async getSponsorMessages(@Param("sponsorId") sponsorId: string) {
    return this.sponsorMessageService.getSponsorMessages(sponsorId);
  }
}
