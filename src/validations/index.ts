import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Location ─────────────────────────────────────────────────
export const locationSchema = z.object({
  name: z.string().min(3).max(150),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  category: z.enum(['candi', 'museum', 'keraton', 'makam', 'situs', 'lainnya']),
});

// ─── Review ───────────────────────────────────────────────────
export const reviewSchema = z.object({
  locationId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─── Audio Guide ──────────────────────────────────────────────
export const audioGuideSchema = z.object({
  locationId: z.number().int().positive(),
  language: z.enum(['id', 'en']).default('id'),
  title: z.string().min(3),
  durationSeconds: z.number().int().default(0),
  transcript: z.string().optional(),
});

// ─── Historical Content ───────────────────────────────────────
export const historicalContentSchema = z.object({
  locationId: z.number().int().positive(),
  language: z.enum(['id', 'en']).default('id'),
  title: z.string().min(3),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      imageUrl: z.string().url().optional(),
    })
  ),
  tags: z.array(z.string()).optional(),
});

// Types
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type LocationDTO = z.infer<typeof locationSchema>;
export type ReviewDTO = z.infer<typeof reviewSchema>;
export type AudioGuideDTO = z.infer<typeof audioGuideSchema>;
export type HistoricalContentDTO = z.infer<typeof historicalContentSchema>;
