import mongoose, { PipelineStage } from "mongoose";

export const getOfferDashboardPipeline = (
  sponsorId: string,
  page: number = 1,
  limit: number = 10,
): PipelineStage[] => {
  return [
    {
      $match: {
        sponsorId: new (mongoose as any).Types.ObjectId(sponsorId),
        status: { $ne: "DELETED" },
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
                    _id: 1,
                    avatarUrl: 1,
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
        ],
      },
    },
    {
      $addFields: {
        newApplications: {
          $size: {
            $filter: {
              input: "$customRiders",
              cond: { $eq: ["$$this.status", "PENDING"] },
            },
          },
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];
};
