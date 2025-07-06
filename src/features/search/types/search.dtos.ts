import {
  ContractType,
  GenderIdentity,
  SocialNetwork,
} from "@kascad-app/shared-types";

import { z } from "zod";

export const SearchDto = z.object({
  search: z.string(),
});

export const AdvancedRiderSearchDto = z.object({
  sports: z
    .array(z.string().min(1, "Sport name cannot be empty"))
    .optional()
    .refine((val) => !val || val.length > 0, {
      message: "If provided, the sports array cannot be empty",
    }),

  country: z
    .string()
    .min(2, "Country must contain at least 2 characters")
    .max(100, "Country cannot exceed 100 characters")
    .optional(),

  gender: z
    .nativeEnum(GenderIdentity, {
      errorMap: () => ({ message: "Invalid gender" }),
    })
    .optional(),

  ageRange: z
    .object({
      min: z
        .number()
        .int("Age minimum must be an integer")
        .min(0, "Age minimum cannot be negative")
        .max(100, "Age minimum cannot exceed 100 years")
        .optional(),
      max: z
        .number()
        .int("Age maximum must be an integer")
        .min(0, "Age maximum cannot be negative")
        .max(100, "Age maximum cannot exceed 100 years")
        .optional(),
    })
    .optional()
    .refine(
      (data) => {
        if (data?.min !== undefined && data?.max !== undefined) {
          return data.min <= data.max;
        }
        return true;
      },
      {
        message: "Age minimum must be less than or equal to age maximum",
      },
    ),

  languages: z
    .array(z.string().min(1, "Language code cannot be empty"))
    .optional()
    .refine((val) => !val || val.length > 0, {
      message: "If provided, the languages array cannot be empty",
    }),

  socialNetworks: z
    .array(
      z.nativeEnum(SocialNetwork, {
        errorMap: () => ({ message: "Invalid social network" }),
      }),
    )
    .optional()
    .refine((val) => !val || val.length > 0, {
      message: "If provided, the social networks array cannot be empty",
    }),

  isAvailable: z.boolean().optional(),

  contractType: z
    .nativeEnum(ContractType, {
      errorMap: () => ({ message: "Invalid contract type" }),
    })
    .optional(),

  searchText: z
    .string()
    .min(1, "Search text cannot be empty")
    .max(100, "Search text cannot exceed 100 characters")
    .optional()
    .transform((val) => val?.trim()),

  page: z
    .number()
    .int("Page number must be an integer")
    .min(1, "Page number must be greater than 0")
    .default(1),

  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be greater than 0")
    .max(100, "Limit cannot exceed 100")
    .default(20),

  sortBy: z
    .enum(["views", "createdAt", "age"], {
      errorMap: () => ({
        message: "Invalid sort criteria. Use: views, createdAt, age",
      }),
    })
    .default("views"),

  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({
        message: "Invalid sort order. Use: asc, desc",
      }),
    })
    .default("desc"),
});

export const QuickRiderSearchDto = z.object({
  sports: z.array(z.string()).optional(),
  country: z.string().optional(),
  isAvailable: z.boolean().optional(),
  searchText: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export const LocationFilterDto = z.object({
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  region: z.string().optional(),
});

export const SearchStatsDto = z.object({
  sports: z.array(z.string()).optional(),
  country: z.string().optional(),
  ageRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export const createSavedSearchDto = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters"),
  sponsorId: z.string().min(1, "Sponsor ID is required"),
  filters: AdvancedRiderSearchDto.omit({ page: true, limit: true }),
});

export const updateSavedSearchDto = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters"),
  filters: AdvancedRiderSearchDto.omit({ page: true, limit: true }),
});

export type AdvancedRiderSearchDto = z.infer<typeof AdvancedRiderSearchDto>;
export type QuickRiderSearchDto = z.infer<typeof QuickRiderSearchDto>;
export type LocationFilterDto = z.infer<typeof LocationFilterDto>;
export type SearchStatsDto = z.infer<typeof SearchStatsDto>;
export type CreateSavedSearchDto = z.infer<typeof createSavedSearchDto>;
export type UpdateSavedSearchDto = z.infer<typeof updateSavedSearchDto>;

export const validateAdvancedSearch = (data: unknown) => {
  return AdvancedRiderSearchDto.safeParse(data);
};

export const validateQuickSearch = (data: unknown) => {
  return QuickRiderSearchDto.safeParse(data);
};

export const SEARCH_CONSTANTS = {
  MAX_SEARCH_TEXT_LENGTH: 100,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MIN_AGE: 0,
  MAX_AGE: 100,
  MIN_COUNTRY_LENGTH: 2,
  MAX_COUNTRY_LENGTH: 100,
} as const;
