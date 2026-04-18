import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planKey } = await request.json()

    if (!planKey || !(planKey in PLANS)) {
      return NextResponse.json({ error: 'Valid plan key is required' }, { status: 400 })
    }

    const priceId = (PLANS as any)[planKey].priceId

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured for this plan' }, { status: 500 })
    }

    // Get or create customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabaseUUID: user.id,
        },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      metadata: {
        supabaseUUID: user.id,
      },
      subscription_data: {
        metadata: {
          supabaseUUID: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
