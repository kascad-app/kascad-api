import { OfferStatus } from "@kascad-app/shared-types";

import { GetOffersQueryDto } from "../interfaces/offer.interfaces";

import { PipelineStage } from "mongoose";

export function getAllOffersPipeline(
  query: GetOffersQueryDto,
): PipelineStage[] {
  const { page, limit, status, sport, contractType } = query;
  const skip = (page - 1) * limit;

  const matchStage: Record<string, any> = {
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
