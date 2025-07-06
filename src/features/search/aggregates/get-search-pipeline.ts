import {
  ContractType,
  GenderIdentity,
  SocialNetwork,
} from "@kascad-app/shared-types";

import { PipelineStage } from "mongoose";

export interface RiderSearchFilters {
  // Filtres de base essentiels
  sports?: string[];
  country?: string;
  gender?: GenderIdentity;
  ageRange?: {
    min?: number;
    max?: number;
  };
  languages?: string[];
  socialNetworks?: SocialNetwork[];

  // Disponibilité
  isAvailable?: boolean;
  contractType?: ContractType;

  // Recherche textuelle
  searchText?: string;

  // Pagination et tri
  page?: number;
  limit?: number;
  sortBy?: "views" | "createdAt" | "age";
  sortOrder?: "asc" | "desc";
}

export const getSearchPipeline = (
  filters: RiderSearchFilters,
): PipelineStage[] => {
  const pipeline: PipelineStage[] = [];

  // 1. Étape d'ajout de champs calculés (âge uniquement)
  pipeline.push({
    $addFields: {
      // Calcul de l'âge en années
      age: {
        $divide: [
          { $subtract: [new Date(), "$identity.birthDate"] },
          365.25 * 24 * 60 * 60 * 1000, // millisecondes dans une année
        ],
      },
    },
  });

  // 2. Construction des conditions de filtrage
  const matchConditions: any[] = [];

  // Filtres essentiels
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

  // Filtre d'âge (calculé à partir de birthDate)
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

  // Filtres de disponibilité
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

  // Recherche textuelle
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

  // Filtre pour les comptes actifs uniquement
  matchConditions.push({
    "status.status": "ACTIVE",
  });

  // 3. Application des filtres
  if (matchConditions.length > 0) {
    pipeline.push({
      $match: { $and: matchConditions },
    });
  }

  // 4. Tri
  const sortBy = filters.sortBy || "views";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  let sortField: string;
  switch (sortBy) {
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

  // 5. Pagination
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100); // Maximum 100 résultats
  const skip = (page - 1) * limit;

  if (skip > 0) {
    pipeline.push({ $skip: skip });
  }

  pipeline.push({ $limit: limit });

  // 6. Projection finale (exclure les champs sensibles)
  pipeline.push({
    $project: {
      password: 0,
      "identifier.strava.identifier": 0,
    },
  });

  return pipeline;
};
