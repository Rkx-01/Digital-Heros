export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  // 1. Total Charity Impact
  const { data: totalCharity } = await supabase
    .from('charity_transactions')
    .select('amount.sum()')
    .single()

  // 2. Contributions per charity
  const { data: perCharity } = await supabase
    .from('charity_transactions')
    .select('charity_id, amount.sum(), charities(name)')

  // 3. User-wise history (latest 50)
  const { data: history } = await supabase
    .from('charity_transactions')
    .select('*, profiles(full_name), charities(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  // 4. Total Prize Pool (un-drawn)
  // We sum amount_contributed where draw_id is null
  const { data: totalPrizePool } = await supabase
    .from('prize_pool')
    .select('amount.sum()')
    .is('draw_id', null)
    .single()

  // 5. Active Subscriptions
  const { count: activeSubs } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return NextResponse.json({
    stats: {
      totalCharityImpact: totalCharity?.sum || 0,
      totalPrizePool: totalPrizePool?.sum || 0,
      activeSubscribers: activeSubs || 0
    },
    perCharity: perCharity || [],
    recentHistory: history || []
  })
}
