
import { z } from "zod";

export const HeroSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  stats: z.record(z.string(), z.string()).optional(),
  image_url: z.string().url().optional(),
});

export const AboutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).optional(),
});

export const EventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
  image_url: z.string().url().optional(),
  category: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  status: z.enum(["draft", "published", "cancelled"]).default("published"),
});

export const TeamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  bio: z.string().optional(),
  image_url: z.string().url().optional(),
  social_links: z.record(z.string(), z.string().url()).optional(),
});

export const PartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
});

export const SettingsSchema = z.object({
  site_name: z.string().min(1),
  contact_email: z.string().email().optional(),
  social_links: z.record(z.string(), z.string().url()).optional(),
  maintenance_mode: z.boolean().default(false),
});

export type Hero = z.infer<typeof HeroSchema>;
export type About = z.infer<typeof AboutSchema>;
export type Event = z.infer<typeof EventSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Partner = z.infer<typeof PartnerSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
