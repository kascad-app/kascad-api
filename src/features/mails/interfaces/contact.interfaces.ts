import { z } from "zod";

export const ContactEmailDto = z.object({
  email: z.object({
    name: z.string().min(1),
    toEmail: z.string().email(),
    message: z.string().min(1),
    subject: z.string().min(1),
  }),
  riderId: z.string(),
});

export type ContactEmailDto = z.infer<typeof ContactEmailDto>;

export const GetSponsorMessagesQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  riderId: z.string().optional(),
});

export type GetSponsorMessagesQueryDto = z.infer<
  typeof GetSponsorMessagesQueryDto
>;
