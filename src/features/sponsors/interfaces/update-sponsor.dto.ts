import { z } from "zod";

const phoneNumberRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
const urlRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&=]*)$/;

export const UpdateSponsorDto = z.object({
  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),

  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters")
    .optional(),

  website: z
    .string()
    .regex(urlRegex, "Invalid website URL format")
    .optional()
    .or(z.literal("")),

  logo: z.string().url("Invalid logo URL format").optional().or(z.literal("")),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),

  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must not exceed 50 characters")
    .optional(),
});

export type UpdateSponsorDto = z.infer<typeof UpdateSponsorDto>;
