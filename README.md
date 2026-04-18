# Charity Draw Golf Platform

A premium, full-stack subscription platform that combines golf performance tracking, monthly reward draws, and charitable impact. Designed for maximum engagement and transparency.

## 🚀 Technical Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS 4 with a Custom Design System
- **Animations**: Framer Motion & Canvas Confetti
- **Backend / Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (Subscription Lifecycle + Webhooks)
- **Validation**: Zod (Full-stack schema enforcement)
- **Icons**: Lucide React

## ✨ Key Features

- **Personalized Dashboard**: High-energy, animated workspace to track scores and impact.
- **Score Integrity**: Strictly enforced "Rolling 5" Stableford score history.
- **The Engine**: Hybrid matching system supporting both **Standard Random** and **Algorithmic Weighted** draws.
- **Operational Simulation**: Admin "Pre-analysis" mode to predict winners and prize splits before publishing.
- **Charity Marketplace**: Choice of charity partners with user-defined contribution splits (10-100%).
- **Winner Proof Pipeline**: Secure upload and verification flow for prize claims.
- **Admin Arsenal**: Comprehensive reporting with CSV exports for users and winners.

## 🛠️ Setup & Deployment

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Supabase Initialization**
   - Execute `supabase/schema.sql` in your Supabase SQL Editor.
   - Run `supabase/seed.sql` to populate initial charity partners.
   - Create a `draw-proofs` bucket in Supabase Storage with "Public" access for read.

3. **Stripe Configuration**
   - Configure a Monthly and Yearly product in Stripe.
   - Copy Price IDs to `.env.local`.
   - Set up the Webhook endpoint to point to `/api/webhooks/stripe`.

4. **Environment Variables**
   Fill in `.env.local` using `.env.local.example` as a template.

5. **Local Development**
   ```bash
   npm run dev
   ```

## 📐 Draw Metrics & Reward logic

Calculated automatically during the monthly publishing cycle:
- **Jackpot (Tier 1)**: 40% Pool + 100% Previous Rollover (Requires 5 match)
- **4-Number Match (Tier 2)**: 35% Pool Share
- **3-Number Match (Tier 3)**: 25% Pool Share
- **Auto-Rollover**: If no Jackpot winner exists, the allocation is added to the next month's `rollover_amount`.

## 🛡️ Administrative Controls

- **Simulation**: Test draw numbers and analyze prize splits before confirming.
- **Verification**: Admins review uploaded scorecards before payouts are marked as paid.
- **Reporting**: Export full user and winner lists for tax and compliance audits.
