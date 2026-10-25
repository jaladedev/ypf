import { z } from "zod";
import { isOwnStorageUrl } from "./util";

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) =>
  text(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens")
  .optional()
  .or(z.literal("").transform(() => undefined));

/** Optional image that must live in our storage (see isOwnStorageUrl). */
const image = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isOwnStorageUrl(v), "Upload the image with the button, don't paste a link")
  .optional()
  .transform((v) => (v ? v : undefined));

const dateTime = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a date and time");

const optDateTime = dateTime.optional().or(z.literal("").transform(() => undefined));

export const intent = z.enum(["save", "publish"]).catch("save");

// ------------------------------------------------------------------ events
export const eventSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
    title: text(200).min(3, "Enter a title (at least 3 characters)"),
    slug,
    summary: optional(500),
    body: optional(20000),
    starts_at: dateTime,
    ends_at: optDateTime,
    venue: optional(200),
    city: optional(120),
    cover_image: image,
    registration_deadline: optDateTime,
    capacity: z
      .string()
      .trim()
      .regex(/^\d{1,6}$/, "Enter a whole number")
      .refine((v) => Number(v) > 0, "Must be more than zero")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    features: z.string().max(2000).optional(),
    intent,
  })
  .refine((v) => !v.ends_at || v.ends_at >= v.starts_at, {
    path: ["ends_at"],
    message: "The end must be after the start",
  });

export const speakerSchema = z.object({
  name: text(200).min(1),
  title: optional(200),
  photo_url: image,
});

// -------------------------------------------------------------------- jobs
export const jobTypes = ["full_time", "part_time", "internship", "nysc", "volunteer", "contract"] as const;
export const experienceLevels = ["entry", "entry_mid", "mid", "senior"] as const;

export const jobSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
    title: text(200).min(3, "Enter a job title (at least 3 characters)"),
    slug,
    organisation: text(200).min(2, "Enter the organisation"),
    description: text(20000).min(20, "Describe the role (at least 20 characters)"),
    requirements: z.string().max(5000).optional(),
    location: optional(200),
    job_type: z.enum(jobTypes, { message: "Choose a job type" }),
    experience_level: z
      .enum(experienceLevels)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    specialisation: optional(200),
    apply_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with https://")
      .optional()
      .transform((v) => (v ? v : undefined)),
    apply_email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address")
      .optional()
      .transform((v) => (v ? v : undefined)),
    deadline: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    intent,
  })
  .refine((v) => v.apply_url || v.apply_email, {
    path: ["apply_url"],
    message: "Add an application link or an email address",
  });

// -------------------------------------------------------------------- posts
export const postCategories = ["advocacy", "events", "careers", "announcements"] as const;

export const postSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  title: text(200).min(3, "Enter a title (at least 3 characters)"),
  slug,
  excerpt: optional(500),
  body: text(100000).min(1, "Write the article"),
  category: z.enum(postCategories, { message: "Choose a category" }),
  cover_image: image,
  published_at: optDateTime,
  intent,
});

// ----------------------------------------------------------------- leaders
export const leaderSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  name: text(200).min(2, "Enter a name"),
  role_title: text(200).min(2, "Enter their role"),
  group: z.enum(["national_executive", "coordinator"], { message: "Choose a group" }),
  photo_url: image,
  bio: optional(1000),
  is_active: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

// ---------------------------------------------------------------- settings
const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with https://");

export const settingsSchema = z.object({
  stats: z.object({
    members_label: text(80).min(1, "Required"),
    reach_value: text(20).min(1, "Required"),
    reach_label: text(80).min(1, "Required"),
    audience_label: text(120).min(1, "Required"),
  }),
  contact: z.object({
    email: z
      .string()
      .trim()
      .max(254)
      .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address"),
    phone: text(40),
    address: text(300),
    hours: text(200),
  }),
  social: z.object({
    linkedin: url,
    twitter: url,
    instagram: url,
    facebook: url,
  }),
  partners: z
    .array(
      z.object({
        name: text(120).min(1),
        logo_url: image,
      }),
    )
    .max(24),
});
