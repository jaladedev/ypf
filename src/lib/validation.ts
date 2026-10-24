import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const eventRegistrationSchema = z.object({
  name: text(120).min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
});

export const contactSchema = z.object({
  name: text(120).min(2, "Enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  subject: text(150).optional(),
  message: text(5000).min(10, "Message must be at least 10 characters"),
  // Honeypot: real people leave this empty.
  website: z.string().max(0).optional(),
});
