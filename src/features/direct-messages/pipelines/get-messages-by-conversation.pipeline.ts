import { ProfileType } from "@kascad-app/shared-types";

import { PipelineStage, Types } from "mongoose";

export interface GetMessagesByConversationParams {
  conversationId: Types.ObjectId;
  page: number;
  limit: number;
}

export function getMessagesByConversationPipeline(
  params: GetMessagesByConversationParams,
): PipelineStage[] {
  const { conversationId, page, limit } = params;
  const skip = (page - 1) * limit;

  return [
    {
      $match: {
        conversationId: conversationId,
      },
    },

    {
      $lookup: {
        from: "riders",
        let: { senderId: "$senderId", senderType: "$senderType" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$senderId"] },
                  { $eq: ["$$senderType", ProfileType.RIDER] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              displayName: 1,
              avatarUrl: 1,
              "identity.firstName": 1,
              "identity.lastName": 1,
              "identity.fullName": 1,
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
        let: { senderId: "$senderId", senderType: "$senderType" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$senderId"] },
                  { $eq: ["$$senderType", ProfileType.SPONSOR] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              displayName: 1,
              avatarUrl: 1,
              companyName: 1,
              type: 1,
            },
          },
        ],
        as: "sponsorData",
      },
    },

    {
      $addFields: {
        senderInfo: {
          $cond: {
            if: { $eq: ["$senderType", ProfileType.RIDER] },
            then: { $arrayElemAt: ["$riderData", 0] },
            else: { $arrayElemAt: ["$sponsorData", 0] },
          },
        },
      },
    },

    {
      $project: {
        _id: 1,
        conversationId: 1,
        senderId: 1,
        senderType: 1,
        content: 1,
        messageType: 1,
        readBy: 1,
        createdAt: 1,
        updatedAt: 1,
        sender: {
          userId: "$senderId",
          userType: "$senderType",
          displayName: "$senderInfo.displayName",
          avatarUrl: "$senderInfo.avatarUrl",
          firstName: "$senderInfo.identity.firstName",
          lastName: "$senderInfo.identity.lastName",
          fullName: "$senderInfo.identity.fullName",
          companyName: "$senderInfo.companyName",
        },
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $facet: {
        messages: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },

    {
      $project: {
        messages: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];
}
