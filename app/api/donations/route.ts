export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const donationSchema = z.object({
  charity_id: z.string().uuid(),
  amount: z.number().min(1, 'Minimum donation is £1'),
  payment_method_id: z.string().optional(), // For actual Stripe integration
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = donationSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 })
  }

  const { charity_id, amount } = result.data

  // NOTE: In a real app, we would process the Stripe payment here.
  // We'll simulate a successful transaction for this build.
  
  const { data: transaction, error } = await supabase
    .from('charity_transactions')
    .insert([{
      user_id: user.id,
      charity_id,
      amount,
      type: 'one_off_donation',
      stripe_payment_id: 'sim_donation_' + Date.now()
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update charity total donated counter atomically
  await supabase.rpc('increment_charity_total', { 
    charity_id_input: charity_id, 
    amount_input: amount 
  })

  return NextResponse.json(transaction)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('charity_transactions')
    .select('*, charities(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
