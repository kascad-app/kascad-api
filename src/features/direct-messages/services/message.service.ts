import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Message, MessageDocument } from "../schemas/messages.schema";

import { Model } from "mongoose";

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly logger: Logger,
  ) {}
}
