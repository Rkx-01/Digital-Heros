import { stripe } from '@/lib/stripe'
import { createStaticAdminClient } from '@/lib/supabase/server'
import { NotificationService } from '@/lib/notifications'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = (await headers()).get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createStaticAdminClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const supabaseUUID = session.metadata?.supabaseUUID
      
      if (supabaseUUID) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        
        await supabase.from('subscriptions').upsert({
          user_id: supabaseUUID,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: (subscription as any).data.items.data[0].plan.id === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly',
          status: 'active',
          current_period_start: new Date((subscription as any).data.current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).data.current_period_end * 1000).toISOString(),
          amount: (subscription as any).data.items.data[0].plan.amount! / 100,
          currency: (subscription as any).data.currency,
        })
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if ((invoice as any).subscription) {
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date((subscription as any).data.current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).data.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', (invoice as any).subscription as string)

        // Fetch User ID and Preferences
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, user_id, amount')
          .eq('stripe_subscription_id', (invoice as any).subscription as string)
          .single()

        if (subData) {
          // Fetch Charity Preference
          const { data: prefs } = await supabase
            .from('user_charity_preferences')
            .select('charity_id, charity_contribution_pct')
            .eq('user_id', subData.user_id)
            .single()

          const amountPaid = Number(invoice.amount_paid) / 100

          // 1. Record Prize Pool contribution (Fixed 20%)
          await supabase.from('prize_pool').insert({
            subscription_id: subData.id,
            user_id: subData.user_id,
            amount_contributed: amountPaid * 0.20,
            stripe_payment_intent_id: invoice.payment_intent as string,
          })

          // 2. Record Charity contribution (User defined %)
          if (prefs?.charity_id) {
            const charityImpact = amountPaid * (Number(prefs.charity_contribution_pct) / 100)
            await supabase.from('charity_transactions').insert({
              user_id: subData.user_id,
              charity_id: prefs.charity_id,
              amount: charityImpact,
              type: 'subscription_split',
              stripe_payment_id: invoice.payment_intent as string
            })

            // Update charity total donated counter
            await supabase.rpc('increment_charity_total', { 
              charity_id_input: prefs.charity_id, 
              amount_input: charityImpact 
            })
          }

          // 3. Notify User (Technical Requirement 13)
          await NotificationService.sendSubscriptionSuccess(subData.user_id)
        }
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as Stripe.Subscription
      const status = (stripeSub.status === 'active' || stripeSub.status === 'trialling') ? 'active' : 'inactive'
      
      await supabase
        .from('subscriptions')
        .update({
          status: status,
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', stripeSub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
