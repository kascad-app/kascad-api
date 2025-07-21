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
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    avatarUrl: 1,
                    country: 1,
                    "identity.firstName": 1,
                    "identity.lastName": 1,
                    "identity.country": 1,
                    "identity.bio": 1,
                    "profile.age": 1,
                    "profile.bio": 1,
                    "profile.location": 1,
                    sports: 1,
                    verified: 1,
                    isAvailable: 1,
                    partnerships: 1,
                    socialMedia: 1,
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
                email: "$rider.email",
                avatarUrl: "$rider.avatarUrl",
                country: "$rider.country",
                identity: "$rider.identity",
                profile: "$rider.profile",
                sports: "$rider.sports",
                verified: "$rider.verified",
                isAvailable: "$rider.isAvailable",
                partnerships: "$rider.partnerships",
                socialMedia: "$rider.socialMedia",
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
        sport: 1,
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
