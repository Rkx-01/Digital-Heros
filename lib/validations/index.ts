import { z } from 'zod'

// ── Score Schemas ──────────────────────────────────────────
export const scoreSchema = z.object({
  score: z
    .number({ required_error: 'Score is required' })
    .int()
    .min(1, 'Score must be at least 1')
    .max(45, 'Score must be at most 45'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export const updateScoreSchema = scoreSchema.extend({
  id: z.string().uuid('Invalid score ID'),
})

export type ScoreInput = z.infer<typeof scoreSchema>

// ── Draw Schemas ──────────────────────────────────────────
export const createDrawSchema = z.object({
  draw_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  draw_type: z.enum(['random', 'algorithmic']),
  notes: z.string().optional(),
})

export type CreateDrawInput = z.infer<typeof createDrawSchema>

// ── Charity Schemas ──────────────────────────────────────
export const charitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
})

export type CharityInput = z.infer<typeof charitySchema>

// ── Profile Schemas ──────────────────────────────────────
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  charity_id: z.string().uuid().optional().nullable(),
  charity_contribution_pct: z.number().min(10).max(100).optional(),
})

// ── Auth Schemas ─────────────────────────────────────────
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  charity_id: z.string().uuid('Please select a charity').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ── Winner Verification ──────────────────────────────────
export const updateWinnerSchema = z.object({
  verification_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  payout_status: z.enum(['pending', 'paid']).optional(),
  admin_notes: z.string().optional(),
})
