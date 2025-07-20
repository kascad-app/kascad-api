import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ContactController } from "./controllers/contact.controller";
import {
  SponsorMessage,
  SponsorMessageSchema,
} from "./schemas/sponsor-message.schema";
import { SponsorMessageService } from "./services/sponsor-message.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SponsorMessage.name, schema: SponsorMessageSchema },
    ]),
  ],
  controllers: [ContactController],
  providers: [SponsorMessageService],
  exports: [SponsorMessageService],
})
export class MailService {}
