import { z } from "zod";

export const CATEGORIES = ["Electronics", "Wallets & IDs", "Keys", "Bags & Books", "Accessories"] as const;

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} must be at least ${min} characters.`).max(max, `${label} must be at most ${max} characters.`);

export const idSchema = z.string().uuid("Invalid id.");

export const registerSchema = z.object({
  full_name: text(2, 100, "Full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters.")
    .regex(/[A-Za-z]/, "Password must contain a letter.")
    .regex(/[0-9]/, "Password must contain a number."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const itemSchema = z.object({
  report_type: z.enum(["lost", "found"], { errorMap: () => ({ message: "Report type must be 'lost' or 'found'." }) }),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(", ")}.` }) }),
  title: text(2, 120, "Title"),
  location: text(2, 120, "Location"),
  description: text(5, 1000, "Description"),
  item_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must look like 2026-11-18.")
    .refine((d) => !isNaN(Date.parse(d)), "That is not a real date.")
    .refine((d) => d <= new Date().toISOString().slice(0, 10), "Date cannot be in the future."),
  image_url: z.union([
      z.literal(""),
      z.string().url("Photo URL must be a valid link.").max(500).refine((u) => u.startsWith("https://"), "Photo URL must start with https://"),
    ]).optional().transform((v) => v || null),
});

export const feedQuery = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(["lost", "found"]).optional(),
  category: z.enum(CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const claimSchema = z.object({
  item_id: idSchema,
  proof_description: text(10, 1000, "Ownership proof"),
});

export const claimStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "recovered"], { errorMap: () => ({ message: "Status must be approved, rejected or recovered." }) }),
});

export const profileSchema = z.object({ full_name: text(2, 100, "Full name") });
