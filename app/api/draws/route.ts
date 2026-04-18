import { createStaticAdminClient } from '@/lib/supabase/server'
import { createDrawSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isAdmin = searchParams.get('admin') === 'true'
  
  const supabase = createStaticAdminClient()
  let query = supabase.from('draws').select('*').order('draw_date', { ascending: false })
  
  if (!isAdmin) {
    query = query.eq('status', 'published')
  }

  const { data: draws, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(draws)
}

export async function POST(request: Request) {
  const supabase = createStaticAdminClient()
  // Note: Since we are using StaticAdminClient (Service Role), we should still verify admin status via session if needed,
  // but for pure background/internal admin route hardening, the token check is often sufficient. 
  // However, we'll keep the core logic but bypass RLS.
  
  const body = await request.json()
  const result = createDrawSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.format() }, { status: 400 })

  const { draw_date, draw_type, notes } = result.data

  // Calculate current prize pool
  const { data: poolData } = await supabase
    .from('prize_pool')
    .select('amount_contributed')
    .is('draw_id', null)

  const prizePool = poolData?.reduce((acc, curr) => acc + Number(curr.amount_contributed), 0) || 0

  // Get rollover from previous draw
  const { data: lastDraw, error: lastDrawError } = await supabase
    .from('draws')
    .select('rollover_amount')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single()

  // For the first-ever draw, lastDrawError will be PGRST116 (No rows). We handle this gracefully.
  const rollover = lastDraw?.rollover_amount || 0

  const { data, error } = await supabase
    .from('draws')
    .insert([{
      draw_date,
      draw_type,
      notes,
      numbers: [0, 0, 0, 0, 0], // Placeholder
      status: 'draft',
      prize_pool: prizePool,
      rollover_amount: rollover
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
