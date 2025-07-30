import {
  ConversationType,
  Participant,
  ProfileType,
} from "@kascad-app/shared-types";

import { MessageStatus } from "../schemas/messages.schema";

import { PipelineStage, Types } from "mongoose";

export interface GetMessagesByConversationParams {
  participant: Participant;
  conversationId: Types.ObjectId;
  page: number;
  limit: number;
}

export function getMessagesByConversationPipeline(
  params: GetMessagesByConversationParams,
): PipelineStage[] {
  const { conversationId, participant, page, limit } = params;
  const skip = (page - 1) * limit;

  return [
    {
      $match: {
        _id: conversationId,
        participants: { $in: [participant] },
      },
    },
    {
      $addFields: {
        otherParticipant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$participants",
                cond: { $ne: ["$$this.userId", participant.userId] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $lookup: {
        from: "riders",
        let: {
          participantId: "$otherParticipant.userId",
          participantType: "$otherParticipant.userType",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$participantId"] },
                  { $eq: ["$type", ProfileType.RIDER] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              firstName: "$identity.firstName",
              lastName: "$identity.lastName",
              logo: "$identity.logo",
              type: 1,
            },
          },
        ],
        as: "riderParticipant",
      },
    },
    {
      $lookup: {
        from: "sponsors",
        let: {
          participantId: "$otherParticipant.userId",
          participantType: "$otherParticipant.userType",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$participantId"] },
                  { $eq: ["$type", ProfileType.SPONSOR] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              logo: "$identity.logo",
              companyName: "$identity.companyName",
              type: 1,
            },
          },
        ],
        as: "sponsorParticipant",
      },
    },
    {
      $addFields: {
        participantInfo: {
          $cond: {
            if: { $eq: ["$otherParticipant.userType", ProfileType.RIDER] },
            then: { $arrayElemAt: ["$riderParticipant", 0] },
            else: { $arrayElemAt: ["$sponsorParticipant", 0] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "offers",
        let: {
          referenceId: "$context.referenceId",
          contextType: "$context.type",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$contextType", ConversationType.JOB_OFFER] },
                  { $eq: [{ $toString: "$_id" }, "$$referenceId"] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
            },
          },
        ],
        as: "offerData",
      },
    },
    {
      $addFields: {
        offerInfo: { $arrayElemAt: ["$offerData", 0] },
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { conversationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$conversationId"] },
                  { $ne: ["$status", MessageStatus.DELETED] },
                ],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        as: "allMessages",
      },
    },
    {
      $addFields: {
        messages: {
          $map: {
            input: { $slice: ["$allMessages", skip, limit] },
            as: "message",
            in: {
              $mergeObjects: [
                "$$message",
                {
                  offer: {
                    $cond: {
                      if: { $ne: ["$offerInfo", null] },
                      then: {
                        _id: "$offerInfo._id",
                        title: "$offerInfo.title",
                        description: "$offerInfo.description",
                        imageUrl: {
                          $arrayElemAt: ["$offerInfo.images.url", 0],
                        },
                        sponsor: "$offerInfo.sponsorInfo",
                      },
                      else: null,
                    },
                  },
                },
              ],
            },
          },
        },
        total: { $size: "$allMessages" },
      },
    },
    {
      $project: {
        participantInfo: 1,
        offerInfo: 1,
        messages: 1,
        total: 1,
      },
    },
  ];
}
