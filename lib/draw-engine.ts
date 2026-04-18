// ── Draw Engine ──────────────────────────────────────────────────────────────
// Handles both random and algorithmic draw number generation

export type DrawType = 'random' | 'algorithmic'

export interface DrawNumbers {
  numbers: number[]
  type: DrawType
}

export interface MatchResult {
  userId: string
  userScores: number[]
  matchedNumbers: number[]
  matchCount: number
  tier: 1 | 2 | 3 | null
}

export interface PrizeDistribution {
  jackpot: number
  tier2: number
  tier3: number
  rolloverAmount: number
}

// ── Generate Draw Numbers ─────────────────────────────────────────────────────

/**
 * Generates 5 unique random numbers between 1 and 45 (lottery style)
 */
export function generateRandomDraw(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) {
      numbers.push(n)
    }
  }
  return numbers.sort((a, b) => a - b)
}

/**
 * Generates 5 numbers using weighted probability based on all users' scores
 * Numbers that appear more frequently in scores get higher probability of being drawn
 */
export function generateAlgorithmicDraw(allScores: number[]): number[] {
  if (allScores.length === 0) return generateRandomDraw()

  // Count frequency of each number 1–45
  const frequency: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) {
    frequency[i] = 0
  }
  for (const score of allScores) {
    if (score >= 1 && score <= 45) {
      frequency[score] = (frequency[score] || 0) + 1
    }
  }

  // Build weighted pool
  const pool: number[] = []
  for (let i = 1; i <= 45; i++) {
    // Base weight = 1 (all numbers have at least some chance)
    // Bonus weight based on frequency
    const weight = 1 + frequency[i]
    for (let w = 0; w < weight; w++) {
      pool.push(i)
    }
  }

  // Sample 5 unique numbers from weighted pool
  const selected: number[] = []
  const poolCopy = [...pool]
  while (selected.length < 5 && poolCopy.length > 0) {
    const idx = Math.floor(Math.random() * poolCopy.length)
    const num = poolCopy[idx]
    if (!selected.includes(num)) {
      selected.push(num)
    }
    // Remove all instances of this number
    for (let i = poolCopy.length - 1; i >= 0; i--) {
      if (poolCopy[i] === num) poolCopy.splice(i, 1)
    }
  }

  // Fill remaining with random if needed
  while (selected.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!selected.includes(n)) selected.push(n)
  }

  return selected.sort((a, b) => a - b)
}

// ── Matching Logic ────────────────────────────────────────────────────────────

/**
 * Compares a user's scores against draw numbers and returns match info
 */
export function calculateMatch(
  userId: string,
  userScores: number[],
  drawNumbers: number[]
): MatchResult {
  // A match occurs when a draw number exists in the user's 5 scores.
  // We count how many UNIQUE draw numbers the user has successfully hit.
  const matchedNumbers = drawNumbers.filter((n) => userScores.includes(n))
  const matchCount = matchedNumbers.length

  let tier: 1 | 2 | 3 | null = null
  if (matchCount === 5) tier = 1
  else if (matchCount === 4) tier = 2
  else if (matchCount === 3) tier = 3

  return { userId, userScores, matchedNumbers, matchCount, tier }
}

// ── Prize Distribution ────────────────────────────────────────────────────────

/**
 * Distributes the prize pool across tiers
 * - 40% → Jackpot (rollover if no winner)
 * - 35% → Tier 2 (split equally)
 * - 25% → Tier 3 (split equally)
 */
export function distributePrizes(
  prizePool: number,
  rolloverAmount: number,
  winners: MatchResult[]
): PrizeDistribution & {
  perUserPrizes: Record<string, number>
} {
  const totalPool = prizePool + rolloverAmount

  const jackpotAllocation = totalPool * 0.4
  const tier2Allocation = totalPool * 0.35
  const tier3Allocation = totalPool * 0.25

  const jackpotWinners = winners.filter((w) => w.tier === 1)
  const tier2Winners = winners.filter((w) => w.tier === 2)
  const tier3Winners = winners.filter((w) => w.tier === 3)

  const perUserPrizes: Record<string, number> = {}
  let rolloverAmount_ = 0

  // Jackpot
  if (jackpotWinners.length > 0) {
    const perPerson = jackpotAllocation / jackpotWinners.length
    jackpotWinners.forEach((w) => {
      perUserPrizes[w.userId] = (perUserPrizes[w.userId] || 0) + perPerson
    })
  } else {
    rolloverAmount_ = jackpotAllocation // Rollover to next draw
  }

  // Tier 2
  if (tier2Winners.length > 0) {
    const perPerson = tier2Allocation / tier2Winners.length
    tier2Winners.forEach((w) => {
      perUserPrizes[w.userId] = (perUserPrizes[w.userId] || 0) + perPerson
    })
  }

  // Tier 3
  if (tier3Winners.length > 0) {
    const perPerson = tier3Allocation / tier3Winners.length
    tier3Winners.forEach((w) => {
      perUserPrizes[w.userId] = (perUserPrizes[w.userId] || 0) + perPerson
    })
  }

  return {
    jackpot: jackpotWinners.length > 0 ? jackpotAllocation : 0,
    tier2: tier2Winners.length > 0 ? tier2Allocation : 0,
    tier3: tier3Winners.length > 0 ? tier3Allocation : 0,
    rolloverAmount: rolloverAmount_,
    perUserPrizes,
  }
}
