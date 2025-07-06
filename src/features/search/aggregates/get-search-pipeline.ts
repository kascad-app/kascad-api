import {
  AccountStatus,
  ContractType,
  GenderIdentity,
  SocialNetwork,
} from "@kascad-app/shared-types";

import { PipelineStage } from "mongoose";

export interface RiderSearchFilters {
  sports?: string[];
  country?: string;
  gender?: GenderIdentity;
  ageRange?: {
    min?: number;
    max?: number;
  };
  languages?: string[];
  socialNetworks?: SocialNetwork[];

  isAvailable?: boolean;
  contractType?: ContractType;

  searchText?: string;

  page?: number;
  limit?: number;
  sortBy?: "views" | "createdAt" | "age";
  sortOrder?: "asc" | "desc";
}

export const getSearchPipeline = (
  filters: RiderSearchFilters,
): PipelineStage[] => {
  const pipeline: PipelineStage[] = [];

  if (filters.ageRange) {
    pipeline.push({
      $addFields: {
        age: {
          $divide: [
            { $subtract: [new Date(), "$identity.birthDate"] },
            365.25 * 24 * 60 * 60 * 1000,
          ],
        },
      },
    });
  }

  const matchConditions: any[] = [];

  if (filters.sports && filters.sports.length > 0) {
    matchConditions.push({
      "preferences.sports": { $in: filters.sports },
    });
  }

  if (filters.country) {
    matchConditions.push({
      "identity.country": { $regex: filters.country, $options: "i" },
    });
  }

  if (filters.gender) {
    matchConditions.push({
      "identity.gender": filters.gender,
    });
  }

  if (filters.ageRange) {
    const ageConditions: any = {};
    if (filters.ageRange.min !== undefined) {
      ageConditions.$gte = filters.ageRange.min;
    }
    if (filters.ageRange.max !== undefined) {
      ageConditions.$lte = filters.ageRange.max;
    }
    if (Object.keys(ageConditions).length > 0) {
      matchConditions.push({ age: ageConditions });
    }
  }

  if (filters.languages && filters.languages.length > 0) {
    matchConditions.push({
      "identity.languageSpoken": { $in: filters.languages },
    });
  }

  if (filters.socialNetworks && filters.socialNetworks.length > 0) {
    matchConditions.push({
      "preferences.networks": { $in: filters.socialNetworks },
    });
  }

  if (filters.isAvailable !== undefined) {
    matchConditions.push({
      "availibility.isAvailable": filters.isAvailable,
    });
  }

  if (filters.contractType) {
    matchConditions.push({
      "availibility.contractType": filters.contractType,
    });
  }

  if (filters.searchText) {
    matchConditions.push({
      $or: [
        { "identity.firstName": { $regex: filters.searchText, $options: "i" } },
        { "identity.lastName": { $regex: filters.searchText, $options: "i" } },
        { "identity.fullName": { $regex: filters.searchText, $options: "i" } },
        { "identity.bio": { $regex: filters.searchText, $options: "i" } },
        {
          "identifier.username": { $regex: filters.searchText, $options: "i" },
        },
      ],
    });
  }

  matchConditions.push({
    "status.status": AccountStatus.ACTIVE,
  });

  if (matchConditions.length > 0) {
    pipeline.push({
      $match: { $and: matchConditions },
    });
  }

  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  let sortField: string;
  switch (filters.sortBy) {
    case "views":
      sortField = "views.lastMonthViews";
      break;
    case "age":
      sortField = "age";
      break;
    case "createdAt":
    default:
      sortField = "createdAt";
      break;
  }

  pipeline.push({
    $sort: { [sortField]: sortOrder },
  });

  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const skip = (page - 1) * limit;

  if (skip > 0) {
    pipeline.push({ $skip: skip });
  }

  pipeline.push({ $limit: limit });

  return pipeline;
};
