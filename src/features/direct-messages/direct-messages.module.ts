import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import {
  Conversation,
  ConversationSchema,
} from "./schemas/conversation.schema";
import { Message, MessageSchema } from "./schemas/messages.schema";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
        collection: MongoDBConnection.CONVERSATIONS,
      },
      {
        name: Message.name,
        schema: MessageSchema,
        collection: MongoDBConnection.MESSAGES,
      },
    ]),
  ],
  controllers: [],
  providers: [Logger],
  exports: [MongooseModule],
})
export class DirectMessagesModule {}
