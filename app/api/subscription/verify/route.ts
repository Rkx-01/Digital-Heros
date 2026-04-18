import { stripe } from '@/lib/stripe'
import { createStaticAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  try {
    const supabase = createStaticAdminClient()
    
    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'pending', message: 'Payment not yet confirmed' })
    }

    const supabaseUUID = session.metadata?.supabaseUUID || (session as any).subscription_details?.metadata?.supabaseUUID

    if (!supabaseUUID) {
      return NextResponse.json({ error: 'User metadata missing from session' }, { status: 400 })
    }

    // 2. Retrieve subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // 3. Manually Sync/Upsert to ensure DB is up to date (Failsafe for missing Webhooks)
    const { error: upsertError } = await supabase.from('subscriptions').upsert({
      user_id: supabaseUUID,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan: (subscription as any).data.items.data[0].plan.id === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly',
      status: 'active',
      current_period_start: new Date((subscription as any).data.current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).data.current_period_end * 1000).toISOString(),
      amount: (subscription as any).data.items.data[0].plan.amount! / 100,
      currency: (subscription as any).data.currency,
      updated_at: new Date().toISOString()
    })

    if (upsertError) {
      console.error('Manual Sync Error:', upsertError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'active', message: 'Subscription verified and synced' })
  } catch (error: any) {
    console.error('Verification API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
