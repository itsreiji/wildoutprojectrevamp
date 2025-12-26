
import { z } from "zod";

export const HeroSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  stats: z.object({
    events: z.string(),
    members: z.string(),
    partners: z.string(),
  }),
});

export const AboutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string(),
  story: z.array(z.string()),
  foundedYear: z.string(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  venue: z.string(),
  venueAddress: z.string(),
  image: z.string(),
  category: z.string(),
  capacity: z.number(),
  attendees: z.number(),
  price: z.string(),
  artists: z.array(z.object({
    name: z.string(),
    role: z.string(),
    image: z.string(),
  })),
  gallery: z.array(z.string()),
  highlights: z.array(z.string()),
  status: z.enum(["upcoming", "ongoing", "completed"]),
});

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  role: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string(),
  photoUrl: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export const PartnerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  category: z.string(),
  website: z.string(),
  logoUrl: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export const SettingsSchema = z.object({
  siteName: z.string().min(1),
  siteDescription: z.string(),
  tagline: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  socialMedia: z.object({
    instagram: z.string(),
    twitter: z.string(),
    facebook: z.string(),
    youtube: z.string(),
  }),
});

export const GalleryImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  caption: z.string(),
  uploadDate: z.string(),
  event: z.string().optional(),
});

export type Hero = z.infer<typeof HeroSchema>;
export type About = z.infer<typeof AboutSchema>;
export type Event = z.infer<typeof EventSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Partner = z.infer<typeof PartnerSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;
