import { PipelineStage } from "mongoose";

export const getRiderApplicationsPipeline = (
  riderId: string,
  page: number = 1,
  limit: number = 10,
): PipelineStage[] => {
  return [
    {
      $match: {
        riderId,
      },
    },
    {
      $addFields: {
        offerObjectId: { $toObjectId: "$offerId" },
      },
    },
    {
      $lookup: {
        from: "offers",
        localField: "offerObjectId",
        foreignField: "_id",
        as: "offer",
        pipeline: [
          {
            $addFields: {
              sponsorObjectId: { $toObjectId: "$sponsorId" },
            },
          },
          {
            $lookup: {
              from: "sponsors",
              localField: "sponsorObjectId",
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
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              sport: 1,
              status: 1,
              contractType: 1,
              budgetMin: 1,
              budgetMax: 1,
              createdAt: 1,
              sponsor: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$offer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        riderId: 1,
        name: 1,
        email: 1,
        phone: 1,
        note: 1,
        createdAt: 1,
        updatedAt: 1,
        offer: 1,
        application: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        applications: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        applications: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];
};
