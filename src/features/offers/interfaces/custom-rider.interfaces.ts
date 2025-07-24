import { ApplicationStatus, ICustomRider } from "@kascad-app/shared-types";

import { z } from "zod";

export type CreateCustomRiderDto = Omit<
  ICustomRider,
  "_id" | "createdAt" | "updatedAt"
>;

export const UpdateCustomRiderDto = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(20).optional(),
  note: z.string().min(1).max(1000).optional(),
  application: z.nativeEnum(ApplicationStatus).optional(),
});

export const CustomRiderParamsDto = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const GetCustomRidersQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  offerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
    .optional(),
  application: z.nativeEnum(ApplicationStatus).optional(),
});

export const GetApplicationsQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export interface ApplicationsResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export type UpdateCustomRiderDto = z.infer<typeof UpdateCustomRiderDto>;
export type CustomRiderParamsDto = z.infer<typeof CustomRiderParamsDto>;
export type GetCustomRidersQueryDto = z.infer<typeof GetCustomRidersQueryDto>;
export type GetApplicationsQueryDto = z.infer<typeof GetApplicationsQueryDto>;
