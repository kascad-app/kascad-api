import { ContractType, SportName } from "@kascad-app/shared-types";

import { z } from "zod";

const OfferStatus = z.enum([
  "draft",
  "active",
  "paused",
  "expired",
  "closed",
  "deleted",
]);
const Currency = z.enum(["EUR", "USD", "GBP"]);

export const CreateOfferDto = z
  .object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    contractType: z.nativeEnum(ContractType),
    sports: z.array(z.nativeEnum(SportName)).min(1),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    currency: Currency.optional().default("EUR"),
  })
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: "budgetMin must be less than or equal to budgetMax",
      path: ["budgetMax"],
    },
  );

export const UpdateOfferDto = z
  .object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(1000).optional(),
    sport: z.string().min(1).optional(),
    contractType: z.nativeEnum(ContractType).optional(),
    sports: z.array(z.nativeEnum(SportName)).min(1).optional(),
    status: OfferStatus.optional(),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    currency: Currency.optional(),
  })
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: "budgetMin must be less than or equal to budgetMax",
      path: ["budgetMax"],
    },
  );

export const GetOffersQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: OfferStatus.optional(),
  sport: z.string().optional(),
  contractType: z.nativeEnum(ContractType).optional(),
});

export const OfferParamsDto = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const GetOffersDashboardQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateOfferDto = z.infer<typeof CreateOfferDto>;
export type UpdateOfferDto = z.infer<typeof UpdateOfferDto>;
export type GetOffersQueryDto = z.infer<typeof GetOffersQueryDto>;
export type OfferParamsDto = z.infer<typeof OfferParamsDto>;
export type GetOffersDashboardQueryDto = z.infer<
  typeof GetOffersDashboardQueryDto
>;
