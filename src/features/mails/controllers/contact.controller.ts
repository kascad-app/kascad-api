import { ResendService } from "nestjs-resend";
import { Body, Controller, Post } from "@nestjs/common";

import { ContactEmailDto } from "../interfaces/contact.interfaces";

import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@Controller("contact")
export class ContactController {
  constructor(private readonly resendService: ResendService) {}

  @Post("send")
  async sendContactEmail(
    @Body(new ZodValidationPipe(ContactEmailDto)) body: ContactEmailDto,
  ) {
    return this.resendService.send({
      from: `"${body.name}" <info@send.kascad.fr>`,
      to: body.toEmail,
      subject: `Contact from ${body.name}`,
      html: `<p>${body.message}</p>`,
    });
  }
}
