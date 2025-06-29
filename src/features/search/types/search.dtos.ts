import { z } from "zod";

export const SearchDto = z.object({
  search: z.string(),
});

export const createSavedSearchDto = z.object({
  name: z.string(),
  sponsorId: z.string(),
  filters: z.record(z.string(), z.string()),
});

export const updateSavedSearchDto = z.object({
  name: z.string(),
  filters: z.record(z.string(), z.string()),
});

export type CreateSavedSearchDto = z.infer<typeof createSavedSearchDto>;
export type UpdateSavedSearchDto = z.infer<typeof updateSavedSearchDto>;
