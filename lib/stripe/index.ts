import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SECRET_KEY
const isServer = typeof window === 'undefined'

if (isServer && !apiKey) {
  console.error('CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.')
}

export const stripe = isServer 
  ? new Stripe(apiKey || 'missing_key', {
      apiVersion: '2024-12-18.acacia' as any,
      typescript: true,
    })
  : null as unknown as Stripe

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'missing_monthly_price',
    amount: 999, // £9.99 in pence
    currency: 'gbp',
    interval: 'month' as const,
    label: 'Monthly',
    description: '£9.99/month',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'missing_yearly_price',
    amount: 8900, // £89/year
    currency: 'gbp',
    interval: 'year' as const,
    label: 'Yearly',
    description: '£89/year',
    savings: 'Save £30.88',
  },
}

export const PRIZE_POOL_PERCENTAGE = 0.20 // 20% of subscription goes to prize pool
export const CHARITY_MIN_PERCENTAGE = 0.10 // 10% minimum charity contribution from the subscription
