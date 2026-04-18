import { generateAlgorithmicDraw, generateRandomDraw } from '@/lib/draw-engine'
import { createClient, createStaticAdminClient } from '@/lib/supabase/server'
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

  const { data: draw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })

  let numbers: number[] = []

  if (draw.draw_type === 'random') {
    numbers = generateRandomDraw()
  } else {
    // Fetch all user scores for algorithmic draw
    const { data: allScores } = await supabase
      .from('scores')
      .select('score')
    
    const scoresArray = allScores?.map(s => s.score) || []
    numbers = generateAlgorithmicDraw(scoresArray)
  }

  // 4. PRE-ANALYSIS: Calculate matches and prizes for this simulation
  // Fetch all users with active subscriptions
  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  const userIds = activeSubscriptions?.map(s => s.user_id) || []
  
  let simulationData = null

  if (userIds.length > 0) {
    // Fetch latest scores for these users
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    const userScoresMap: Record<string, number[]> = {}
    allScores?.forEach(s => {
      if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = []
      userScoresMap[s.user_id].push(s.score)
    })

    // Calculate matches
    const { calculateMatch, distributePrizes } = await import('@/lib/draw-engine')
    const matchResults = Object.entries(userScoresMap).map(([userId, scores]) => 
      calculateMatch(userId, scores, numbers)
    ).filter(r => r.tier !== null)

    // Calculate prize distribution
    const distribution = distributePrizes(
      Number(draw.prize_pool),
      Number(draw.rollover_amount),
      matchResults
    )

    simulationData = {
      tier1Count: matchResults.filter(r => r.tier === 1).length,
      tier2Count: matchResults.filter(r => r.tier === 2).length,
      tier3Count: matchResults.filter(r => r.tier === 3).length,
      totalMatches: matchResults.length,
      estimatedJackpotShare: matchResults.filter(r => r.tier === 1).length > 0 
        ? distribution.jackpot / matchResults.filter(r => r.tier === 1).length 
        : 0,
      estimatedTier2Share: matchResults.filter(r => r.tier === 2).length > 0 
        ? distribution.tier2 / matchResults.filter(r => r.tier === 2).length 
        : 0,
      estimatedTier3Share: matchResults.filter(r => r.tier === 3).length > 0 
        ? distribution.tier3 / matchResults.filter(r => r.tier === 3).length 
        : 0,
      rolloverResult: distribution.rolloverAmount
    }
  }

  // Update draw with simulated numbers and pre-analysis data
  const { data, error } = await supabase
    .from('draws')
    .update({ 
      numbers, 
      status: 'simulated',
      simulation_data: simulationData
    })
    .eq('id', drawId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
