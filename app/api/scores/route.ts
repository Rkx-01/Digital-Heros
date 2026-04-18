import { createClient } from '@/lib/supabase/server'
import { scoreSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(scores)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (subscription?.status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
  }

  const body = await request.json()
  const result = scoreSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 })
  }

  const { score, date } = result.data

  // Fetch current scores
  const { data: currentScores } = await supabase
    .from('scores')
    .select('id, date')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (currentScores && currentScores.length >= 5) {
    // Delete oldest score
    const oldest = currentScores[0]
    await supabase.from('scores').delete().eq('id', oldest.id)
  }

  // Insert new score
  const { data, error } = await supabase
    .from('scores')
    .insert([{ user_id: user.id, score, date }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A score already exists for this date' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
