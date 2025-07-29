import { Participant } from "@kascad-app/shared-types";

import { PipelineStage } from "mongoose";

export interface GetUnreadMessagesParams {
  participant: Participant;
}

export function getUnreadMessagesPipeline(
  params: GetUnreadMessagesParams,
): PipelineStage[] {
  const { participant } = params;

  return [
    {
      $match: {
        participants: {
          $elemMatch: {
            userId: participant.userId,
            userType: participant.userType,
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
                  { $ne: ["$senderId", participant.userId] },
                  {
                    $not: {
                      $in: [
                        participant.userId,
                        {
                          $map: {
                            input: "$readBy",
                            as: "read",
                            in: "$$read.userId",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
        as: "unreadMessages",
      },
    },

    {
      $match: {
        "unreadMessages.0": { $exists: true },
      },
    },

    {
      $project: {
        conversationId: "$_id",
        unreadMessages: {
          $map: {
            input: "$unreadMessages",
            as: "message",
            in: {
              _id: "$$message._id",
              conversationId: "$$message.conversationId",
              senderId: "$$message.senderId",
              senderType: "$$message.senderType",
              content: "$$message.content",
              messageType: "$$message.messageType",
              createdAt: "$$message.createdAt",
            },
          },
        },
        unreadCount: { $size: "$unreadMessages" },
      },
    },
  ];
}

export function getUnreadCountPipeline(
  params: GetUnreadMessagesParams,
): PipelineStage[] {
  const { participant } = params;

  return [
    {
      $match: {
        participants: {
          $elemMatch: {
            userId: participant.userId,
            userType: participant.userType,
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
                  { $ne: ["$senderId", participant.userId] },
                  {
                    $not: {
                      $in: [
                        participant.userId,
                        {
                          $map: {
                            input: "$readBy",
                            as: "read",
                            in: "$$read.userId",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "unreadCountData",
      },
    },

    {
      $project: {
        conversationId: "$_id",
        unreadCount: {
          $ifNull: [{ $arrayElemAt: ["$unreadCountData.count", 0] }, 0],
        },
      },
    },

    {
      $match: {
        unreadCount: { $gt: 0 },
      },
    },

    {
      $group: {
        _id: null,
        totalUnreadCount: { $sum: "$unreadCount" },
        conversationsWithUnread: {
          $push: {
            conversationId: "$conversationId",
            unreadCount: "$unreadCount",
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        totalUnreadCount: 1,
        conversationsWithUnread: 1,
      },
    },
  ];
}
