import { z } from "zod";

export const ContactEmailDto = z.object({
  name: z.string().min(1),
  toEmail: z.string().email(),
  message: z.string().min(1),
});

export type ContactEmailDto = z.infer<typeof ContactEmailDto>;
