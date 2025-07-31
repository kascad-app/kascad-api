import { OfferStatus } from "@kascad-app/shared-types";

import mongoose, { PipelineStage } from "mongoose";

export function getOfferWithCustomRidersPipeline(
  offerId: string,
  sponsorId: string,
): PipelineStage[] {
  return [
    {
      $match: {
        _id: new (mongoose as any).Types.ObjectId(offerId),
        sponsorId: new (mongoose as any).Types.ObjectId(sponsorId),
        status: { $ne: OfferStatus.DELETED },
      },
    },
    {
      $lookup: {
        from: "custom-riders",
        localField: "_id",
        foreignField: "offerId",
        as: "customRiders",
        pipeline: [
          {
            $lookup: {
              from: "riders",
              localField: "riderId",
              foreignField: "_id",
              as: "rider",
              pipeline: [
                {
                  $project: {
                    avatarUrl: 1,
                    firstName: "$identity.firstName",
                    lastName: "$identity.lastName",
                    country: "$identity.country",
                    bio: "$identity.bio",
                    sports: "$preferences.sports",
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$rider",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              phone: 1,
              note: 1,
              application: 1,
              createdAt: 1,
              updatedAt: 1,
              rider: {
                _id: "$rider._id",
                firstName: "$rider.firstName",
                lastName: "$rider.lastName",
                avatarUrl: "$rider.avatarUrl",
                country: "$rider.country",
                sports: "$rider.sports",
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        sports: 1,
        contractType: 1,
        status: 1,
        budgetMin: 1,
        budgetMax: 1,
        currency: 1,
        createdAt: 1,
        updatedAt: 1,
        customRiders: 1,
        customRidersCount: { $size: "$customRiders" },
      },
    },
  ];
}
