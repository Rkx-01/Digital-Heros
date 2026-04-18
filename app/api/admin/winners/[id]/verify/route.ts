export const dynamic = 'force-dynamic';
import { createClient, createStaticAdminClient } from '@/lib/supabase/server'
import { NotificationService } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: winnerId } = await params
  const cookieSupabase = await createClient()
  
  // Verify admin status
  const { data: { user: authUser } } = await cookieSupabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await cookieSupabase.from('profiles').select('role').eq('id', authUser.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const supabase = createStaticAdminClient()
  const { verification_status, payout_status, admin_notes } = await request.json()

  // 1. Fetch current record to get user_id for notification
  const { data: winner } = await supabase
    .from('draw_winners')
    .select('user_id, verification_status')
    .eq('id', winnerId)
    .single()

  if (!winner) return NextResponse.json({ error: 'Winner record not found' }, { status: 404 })

  // 2. Update the record
  const { error: updateError } = await supabase
    .from('draw_winners')
    .update({ 
      verification_status: verification_status || winner.verification_status,
      payout_status,
      admin_notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', winnerId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // 3. Trigger Notification if verification status changed to approved or rejected
  if (verification_status && verification_status !== winner.verification_status) {
    if (verification_status === 'approved' || verification_status === 'rejected') {
      await NotificationService.sendVerificationUpdate(winner.user_id, verification_status)
    }
  }

  return NextResponse.json({ success: true })
}
