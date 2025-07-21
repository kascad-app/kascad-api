import { GetCustomRidersQueryDto } from "../interfaces/custom-rider.interfaces";

import mongoose, { PipelineStage } from "mongoose";

export function getCustomRidersPipeline(
  offerIds: string[],
  query: GetCustomRidersQueryDto,
): PipelineStage[] {
  const { page, limit, application } = query;
  const skip = (page - 1) * limit;

  const matchStage: any = {
    offerId: {
      $in: offerIds.map((id) => new (mongoose as any).Types.ObjectId(id)),
    },
  };

  if (application) {
    matchStage.application = application;
  }

  return [
    {
      $match: matchStage,
    },
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
              "profile.age": 1,
              "profile.bio": 1,
              sports: 1,
              verified: 1,
              isAvailable: 1,
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
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
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
        },
      },
    },
  ];
}

export function getCustomRiderByIdPipeline(
  customRiderId: string,
): PipelineStage[] {
  return [
    {
      $match: {
        _id: new (mongoose as any).Types.ObjectId(customRiderId),
      },
    },
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
  ];
}

export function getCustomRidersCountPipeline(
  offerIds: string[],
  application?: string,
): PipelineStage[] {
  const matchStage: any = {
    offerId: {
      $in: offerIds.map((id) => new (mongoose as any).Types.ObjectId(id)),
    },
  };

  if (application) {
    matchStage.application = application;
  }

  return [
    {
      $match: matchStage,
    },
    {
      $count: "total",
    },
  ];
}
