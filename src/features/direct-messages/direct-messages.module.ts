import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./controllers/conversations.controller";
import { MessagesController } from "./controllers/messages.controller";
import {
  Conversation,
  ConversationSchema,
} from "./schemas/conversation.schema";
import { Message, MessageSchema } from "./schemas/messages.schema";
import { ConversationService } from "./services/conversation.service";
import { MessageService } from "./services/message.service";

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
  controllers: [ConversationsController, MessagesController],
  providers: [Logger, ConversationService, MessageService],
  exports: [MongooseModule, ConversationService, MessageService],
})
export class DirectMessagesModule {}
