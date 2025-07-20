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
      from: `"${body.name}" `,
      to: "delivered@resend.dev",
      subject: "hello world",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });
  }
}
