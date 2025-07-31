import {
  ConversationStatus,
  ConversationType,
  ProfileType,
} from "@kascad-app/shared-types";

import { MessageStatus } from "../schemas/messages.schema";

import { PipelineStage, Types } from "mongoose";

export interface GetUserConversationsParams {
  participant: {
    userId: Types.ObjectId;
    userType: ProfileType;
  };
  page: number;
  limit: number;
  contextType?: ConversationType;
}

export function getUserConversationsPipeline(
  params: GetUserConversationsParams,
): PipelineStage[] {
  const { participant, page, limit, contextType } = params;
  const skip = (page - 1) * limit;

  const matchStage = {
    status: ConversationStatus.ACTIVE,
    participants: {
      $elemMatch: {
        userId: participant.userId,
        userType: participant.userType,
      },
    },
  };

  if (contextType) {
    matchStage["context.type"] = contextType;
  }

  return [
    {
      $match: matchStage,
    },

    {
      $addFields: {
        otherParticipant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$participants",
                cond: {
                  $ne: ["$$this.userId", participant.userId],
                },
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
        let: { userId: "$otherParticipant.userId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              _id: 1,
              avatarUrl: 1,
              firstName: "$identity.firstName",
              lastName: "$identity.lastName",
              fullName: "$identity.fullName",
              type: 1,
            },
          },
        ],
        as: "riderData",
      },
    },

    {
      $lookup: {
        from: "sponsors",
        let: { userId: "$otherParticipant.userId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              _id: 1,
              avatarUrl: 1,
              companyName: "$identity.companyName",
              type: 1,
            },
          },
        ],
        as: "sponsorData",
      },
    },

    {
      $addFields: {
        otherParticipantInfo: {
          $cond: {
            if: { $eq: ["$otherParticipant.userType", ProfileType.RIDER] },
            then: { $arrayElemAt: ["$riderData", 0] },
            else: { $arrayElemAt: ["$sponsorData", 0] },
          },
        },
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
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 1,
              senderId: 1,
              senderType: 1,
              content: 1,
              messageType: 1,
              createdAt: 1,
            },
          },
        ],
        as: "lastMessage",
      },
    },

    {
      $project: {
        _id: 1,
        participants: 1,
        context: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        otherParticipant: {
          userId: "$otherParticipant.userId",
          userType: "$otherParticipant.userType",
          avatarUrl: "$otherParticipantInfo.avatarUrl",
          firstName: "$otherParticipantInfo.firstName",
          lastName: "$otherParticipantInfo.lastName",
          fullName: "$otherParticipantInfo.fullName",
          companyName: "$otherParticipantInfo.companyName",
        },
        lastMessage: {
          $arrayElemAt: ["$lastMessage", 0],
        },
      },
    },

    {
      $sort: {
        updatedAt: -1,
      },
    },

    {
      $facet: {
        conversations: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },

    {
      $project: {
        conversations: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];
}
