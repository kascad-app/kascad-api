import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ContactController } from "./controllers/contact.controller";
import { SponsorMessageSchema } from "./schemas/sponsor-message.schema";
import { SponsorMessageService } from "./services/sponsor-message.service";

import MongoDBConnection from "src/common/constants/mongoDbConnections";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "sponsor-messages",
        schema: SponsorMessageSchema,
        collection: MongoDBConnection.SPONSOR_MESSAGES,
      },
    ]),
  ],
  controllers: [ContactController],
  providers: [SponsorMessageService],
  exports: [SponsorMessageService],
})
export class MailService {}
