import { createClient } from '@/lib/supabase/server'
import { updateScoreSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  // Add ID to body for validation
  const result = updateScoreSchema.safeParse({ ...body, id })

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 })
  }

  const { score, date } = result.data

  const { data, error } = await supabase
    .from('scores')
    .update({ score, date, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id) // Security: Ensure user owns the score
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Score deleted successfully' })
}
