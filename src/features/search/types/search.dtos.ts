import { z } from "zod";

export const SearchDto = z.object({
  search: z.string(),
});
