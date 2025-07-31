import { ConversationType, OfferStatus } from "@kascad-app/shared-types";

import { GetOffersQueryDto } from "../interfaces/offer.interfaces";

import { PipelineStage } from "mongoose";

export function getAllOffersPipeline(
  query: GetOffersQueryDto,
  riderId?: string,
): PipelineStage[] {
  const { page, limit, status, sport, contractType } = query;
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = {
    status: { $ne: OfferStatus.DELETED },
  };

  if (status) {
    matchStage.status = status;
  }
  if (sport) {
    matchStage.sports = { $in: [sport] };
  }
  if (contractType) {
    matchStage.contractType = contractType;
  }

  return [
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "sponsors",
        localField: "sponsorId",
        foreignField: "_id",
        as: "sponsor",
        pipeline: [
          {
            $project: {
              _id: 1,
              "identity.companyName": 1,
              avatarUrl: 1,
              location: 1,
            },
          },
          {
            $addFields: {
              companyName: "$identity.companyName",
            },
          },
          {
            $unset: "identity",
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$sponsor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "conversations",
        let: {
          offerId: { $toString: "$_id" },
          ...(riderId && { currentRiderId: riderId }),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$context.referenceId", "$$offerId"] },
                  { $eq: ["$context.type", ConversationType.JOB_OFFER] },
                  ...(riderId
                    ? [
                        {
                          $in: [
                            riderId,
                            {
                              $map: {
                                input: "$participants",
                                as: "participant",
                                in: { $toString: "$$participant.userId" },
                              },
                            },
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: "conversation",
      },
    },
    {
      $addFields: {
        conversationId: {
          $cond: {
            if: { $gt: [{ $size: "$conversation" }, 0] },
            then: { $arrayElemAt: ["$conversation._id", 0] },
            else: null,
          },
        },
      },
    },
    {
      $unset: "conversation",
    },
    ...(riderId
      ? [
          {
            $lookup: {
              from: "custom-riders",
              let: { offerId: "$_id", currentRiderId: riderId },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$offerId", { $toString: "$$offerId" }] },
                        { $eq: ["$riderId", "$$currentRiderId"] },
                      ],
                    },
                  },
                },
              ],
              as: "application",
            },
          },
        ]
      : []),
    {
      $addFields: {
        alreadyApplied: riderId
          ? { $gt: [{ $size: "$application" }, 0] }
          : false,
      },
    },
    {
      $unset: "application",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        offers: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        offers: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];
}
