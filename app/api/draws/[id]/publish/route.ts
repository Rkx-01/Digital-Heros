import { calculateMatch, distributePrizes } from '@/lib/draw-engine'
import { createClient, createStaticAdminClient } from '@/lib/supabase/server'
import { NotificationService } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: drawId } = await params
  const cookieSupabase = await createClient()
  
  // Verify admin status from session
  const { data: { user: authUser } } = await cookieSupabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await cookieSupabase.from('profiles').select('role').eq('id', authUser.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const supabase = createStaticAdminClient()

  // 1. Get the draw info
  const { data: draw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (!draw || draw.status !== 'simulated') {
    return NextResponse.json({ error: 'Draw must be simulated before publishing' }, { status: 400 })
  }

  // 2. Fetch all users with active subscriptions
  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  const userIds = (activeSubscriptions as any[])?.map(s => s.user_id) || []
  if (userIds.length === 0) {
    // No participants, EVERYTHING rolls over to the next draw
    const totalRollover = Number(draw.prize_pool) + Number(draw.rollover_amount)
    
    await supabase.from('draws').update({ 
      status: 'published',
      rollover_amount: totalRollover,
      jackpot_amount: 0,
      tier2_amount: 0,
      tier3_amount: 0,
      total_participants: 0,
      updated_at: new Date().toISOString()
    }).eq('id', drawId)

    return NextResponse.json({ 
      message: 'Draw published with no participants. Total pool rolled over.',
      rollover: totalRollover
    })
  }

  // 3. Fetch latest scores for these users
  const { data: allScores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)

  // Group scores by user
  const userScoresMap: Record<string, number[]> = {};
  (allScores as any[])?.forEach(s => {
    if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = []
    userScoresMap[s.user_id].push(s.score)
  })

  // 4. Calculate matches
  const matchResults = Object.entries(userScoresMap).map(([userId, scores]) => 
    calculateMatch(userId, scores, draw.numbers)
  ).filter(r => r.tier !== null)

  // 5. Distribute prizes
  const distribution = distributePrizes(
    Number(draw.prize_pool),
    Number(draw.rollover_amount),
    matchResults
  )

  // 6. Record winners
  const winnerInserts = (matchResults as any[]).map(res => ({
    draw_id: drawId,
    user_id: res.userId,
    tier: res.tier,
    matched_numbers: res.matchedNumbers,
    prize_amount: distribution.perUserPrizes[res.userId] || 0,
    verification_status: 'pending',
    payout_status: 'pending'
  }))

  if (winnerInserts.length > 0) {
    const { error: winnerError } = await supabase.from('draw_winners').insert(winnerInserts)
    if (winnerError) return NextResponse.json({ error: winnerError.message }, { status: 500 })
  }

  // 7. Finalize draw record
  const { error: updateError } = await supabase
    .from('draws')
    .update({ 
      status: 'published',
      jackpot_amount: distribution.jackpot,
      tier2_amount: distribution.tier2,
      tier3_amount: distribution.tier3,
      rollover_amount: distribution.rolloverAmount,
      total_participants: userIds.length
    })
    .eq('id', drawId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // 8. Link prize pool contributions to this draw
  await supabase
    .from('prize_pool')
    .update({ draw_id: drawId })
    .is('draw_id', null)

  // 9. Notify Participants (Technical Requirement 13)
  try {
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
    const participantData = userIds.map(uid => {
      const authUser = authUsers.find(au => au.id === uid)
      const isWinner = winnerInserts.some(w => w.user_id === uid)
      return {
        email: authUser?.email || '',
        isWinner
      }
    }).filter(p => p.email !== '')

    await NotificationService.sendDrawResults(drawId, participantData)
  } catch (error) {
    console.error('Failed to send notifications:', error)
    // Non-blocking for the API response
  }

  return NextResponse.json({ 
    message: 'Draw published successfully',
    winners: winnerInserts.length,
    rollover: distribution.rolloverAmount
  })
}
