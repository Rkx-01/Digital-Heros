
import { createStaticAdminClient } from './lib/supabase/server.ts'
import { generateRandomDraw, generateAlgorithmicDraw, calculateMatch, distributePrizes } from './lib/draw-engine.ts'

async function testSimulation(drawId) {
  console.log('Testing simulation for draw:', drawId)
  const supabase = createStaticAdminClient()
  
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError) {
    console.error('Draw fetch error:', drawError)
    return
  }

  console.log('Draw found:', draw.draw_type)

  let numbers = []
  if (draw.draw_type === 'random') {
    numbers = generateRandomDraw()
  } else {
    const { data: allScores } = await supabase.from('scores').select('score')
    const scoresArray = allScores?.map(s => s.score) || []
    numbers = generateAlgorithmicDraw(scoresArray)
  }
  console.log('Generated numbers:', numbers)

  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  const userIds = activeSubscriptions?.map(s => s.user_id) || []
  console.log('Active user IDs count:', userIds.length)

  let simulationData = null
  if (userIds.length > 0) {
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    const userScoresMap = {}
    allScores?.forEach(s => {
      if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = []
      userScoresMap[s.user_id].push(s.score)
    })

    const matchResults = Object.entries(userScoresMap).map(([userId, scores]) => 
      calculateMatch(userId, scores, numbers)
    ).filter(r => r.tier !== null)

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

  console.log('Simulation data prepared:', simulationData)

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

  if (error) {
    console.error('Update error:', error)
  } else {
    console.log('Success!', data.status)
  }
}

// Get the first draft draw ID to test
const supabase = createStaticAdminClient()
supabase.from('draws').select('id').eq('status', 'draft').limit(1).single()
  .then(({data}) => {
    if (data) testSimulation(data.id)
    else console.log('No draft draws found to test')
  })
