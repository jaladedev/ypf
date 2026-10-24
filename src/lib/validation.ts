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

// ---------------------------------------------------------------- membership
import { nigerianStates } from "@/lib/nigeria";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const applicationSchema = z.object({
  // Step 1: personal
  full_name: text(120).min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number")
    .max(25)
    .regex(/^[+\d][\d\s()-]*$/, "Use digits, spaces and + only"),
  state: z.enum(nigerianStates, { message: "Choose your state" }),
  // Step 2: education
  institution: text(200).min(2, "Enter your institution"),
  career_stage: z.enum(["student", "graduate", "early_career", "professional"], {
    message: "Choose your current stage",
  }),
  qualification: text(150).min(2, "Enter your course or qualification"),
  graduation_year: z
    .string()
    .trim()
    .regex(/^(19|20)\d{2}$/, "Enter a 4-digit year")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  // Step 3: professional
  specialisation: text(120).min(2, "Enter your area of interest"),
  organisation: optionalText(150),
  linkedin_url: z
    .string()
    .trim()
    .url("Enter a full link starting with https://")
    .refine((v) => /^https?:\/\//.test(v), "Enter a full link starting with https://")
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  nitp_number: optionalText(50),
  motivation: text(1000).min(20, "Tell us a little more (at least 20 characters)"),
});
export type ApplicationAnswers = z.output<typeof applicationSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;

/** Fields validated at each step of the Join form. */
export const joinStepFields = [
  ["full_name", "phone", "state"],
  ["institution", "career_stage", "qualification", "graduation_year"],
  ["specialisation", "organisation", "linkedin_url", "nitp_number", "motivation"],
] as const satisfies readonly (readonly (keyof ApplicationInput)[])[];

export const accountSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
    terms: z.literal(true, { message: "Please accept the terms to continue" }),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The two passwords don't match",
  });

export const profileSchema = z.object({
  full_name: text(120).min(2, "Enter your full name"),
  phone: z.string().trim().max(25).optional(),
  institution: optionalText(200),
  career_stage: z
    .enum(["student", "graduate", "early_career", "professional"])
    .optional(),
  specialisation: optionalText(120),
  bio: optionalText(600),
  linkedin_url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^https?:\/\//.test(v),
      "Enter a full link starting with https://",
    )
    .optional(),
});

export const reviewSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000).optional(),
});
