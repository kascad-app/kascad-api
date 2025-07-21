import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { SponsorMessageDocument } from "../schemas/sponsor-message.schema";

import { Model, Schema as MongooseSchema } from "mongoose";

@Injectable()
export class SponsorMessageService {
  constructor(
    @InjectModel("sponsor-messages")
    private sponsorMessageModel: Model<SponsorMessageDocument>,
    private readonly logger: Logger,
  ) {}

  async saveSponsorMessage(messageData: {
    sponsorId: string | MongooseSchema.Types.ObjectId;
    riderId: string | MongooseSchema.Types.ObjectId;
    subject: string;
    message: string;
    senderEmail: string;
    recipientEmail: string;
    senderName: string;
    recipientName: string;
  }): Promise<SponsorMessageDocument> {
    const newMessage = new this.sponsorMessageModel(messageData);
    return newMessage.save();
  }

  async getSponsorMessages(sponsorId: string) {
    try {
      const [messages, total] = await Promise.all([
        this.sponsorMessageModel
          .find({ sponsorId })
          .sort({ sentAt: -1 })
          .exec(),
        this.sponsorMessageModel.countDocuments({ sponsorId }).exec(),
      ]);

      return {
        messages,
        total,
      };
    } catch (error) {
      this.logger.error("Error getting sponsor messages:", error);
      throw error;
    }
  }

  async updateMessageStatus(
    messageId: string,
    status: "sent" | "delivered" | "failed",
  ): Promise<SponsorMessageDocument> {
    return this.sponsorMessageModel
      .findByIdAndUpdate(messageId, { status }, { new: true })
      .exec();
  }
}
