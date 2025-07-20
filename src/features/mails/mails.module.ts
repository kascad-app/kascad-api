import { Module } from "@nestjs/common";

import { ContactController } from "./controllers/contact.controller";

@Module({
  imports: [],

  controllers: [ContactController],
  providers: [],
  exports: [],
})
export class MailService {}
