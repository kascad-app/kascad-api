import { ConversationType, ProfileType } from "@kascad-app/shared-types";

import { MessageStatus } from "../schemas/messages.schema";

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
        status: { $ne: MessageStatus.DELETED },
      },
    },

    {
      $lookup: {
        from: "conversations",
        let: { conversationId: "$conversationId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$conversationId"] },
            },
          },
          {
            $project: {
              context: 1,
            },
          },
        ],
        as: "conversationData",
      },
    },

    {
      $addFields: {
        conversationContext: { $arrayElemAt: ["$conversationData", 0] },
      },
    },

    {
      $lookup: {
        from: "offers",
        let: {
          referenceId: "$conversationContext.context.referenceId",
          contextType: "$conversationContext.context.type",
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
            $lookup: {
              from: "sponsors",
              localField: "createdBy",
              foreignField: "_id",
              as: "sponsorInfo",
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              "images.url": 1,
              sponsorInfo: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$sponsorInfo",
                      as: "sponsor",
                      in: {
                        companyName: "$$sponsor.companyName",
                        avatarUrl: "$$sponsor.avatarUrl",
                      },
                    },
                  },
                  0,
                ],
              },
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
        offer: {
          $cond: {
            if: { $ne: ["$offerInfo", null] },
            then: {
              _id: "$offerInfo._id",
              title: "$offerInfo.title",
              description: "$offerInfo.description",
              imageUrl: { $arrayElemAt: ["$offerInfo.images.url", 0] },
              sponsor: "$offerInfo.sponsorInfo",
            },
            else: null,
          },
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
