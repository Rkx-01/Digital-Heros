export const dynamic = 'force-dynamic';
"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { FileUpload } from "@/components/ui/FileUpload"

export default function WinningsPage() {
  const [winnings, setWinnings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState<string | null>(null)
  
  const fetchWinnings = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('draw_winners')
      .select('*, draws(draw_date)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setWinnings(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchWinnings()
  }, [fetchWinnings])

  async function handleUploadProof(winnerId: string, file: File) {
    setSubmitting(winnerId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Session expired. Please log in again.")
      setSubmitting(null)
      return
    }

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${winnerId}/${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('draw-proofs')
      .upload(fileName, file)

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`)
      setSubmitting(null)
      return
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage.from('draw-proofs').getPublicUrl(fileName)

    // 3. Update Record
    const { error: updateError } = await supabase
      .from('draw_winners')
      .update({ 
        proof_url: publicUrl,
        verification_status: 'pending' 
      })
      .eq('id', winnerId)

    if (updateError) {
      alert(`Failed to update winner record: ${updateError.message}`)
    } else {
      await fetchWinnings()
    }
    setSubmitting(null)
  }

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Auditing your victories...</div>

  return (
    <div className="space-y-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">My Winnings</h1>
          <p className="text-surface-500 font-medium leading-relaxed">Track your prize claims and verification status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {winnings.length > 0 ? (
          winnings.map((win) => (
            <Card key={win.id} padding="none" className="overflow-hidden relative border-surface-200 bg-white shadow-xl shadow-surface-900/5 rounded-[2rem]">
              <div className="p-10">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  {/* Left: Prize Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge variant={win.tier === 1 ? 'accent' : 'outline'} className="uppercase font-black text-[9px] tracking-widest px-4 py-1.5 rounded-full">
                        Tier {win.tier} Awarded
                      </Badge>
                      <span className="text-[10px] font-black uppercase text-surface-400 tracking-widest">Ref: {win.id.slice(0, 8)}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-5xl font-extrabold text-surface-900 tracking-tighter leading-none">{formatCurrency(win.prize_amount)}</h3>
                      <p className="text-xs font-bold text-surface-400 mt-2 uppercase tracking-widest">
                        Official Draw: {formatDate(win.draws.draw_date)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                       <StatusBadge status={win.verification_status} label="Verification" />
                       <StatusBadge status={win.payout_status} label="Payout" />
                    </div>
                  </div>

                  {/* Right: Verification Action */}
                  <div className="flex flex-col justify-center min-w-[280px]">
                    {!win.proof_url ? (
                      <div className="space-y-4">
                         <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-10">
                             <AlertCircle className="w-12 h-12 text-amber-600" />
                           </div>
                           <p className="text-xs text-amber-700 font-black uppercase tracking-widest flex items-center gap-2 mb-1.5">
                             <AlertCircle className="w-4 h-4" /> Action Required
                           </p>
                           <p className="text-[11px] text-amber-600/80 font-bold leading-relaxed">Please submit a screenshot of your 5 qualifying scores to complete the award validation.</p>
                         </div>
                          <FileUpload 
                            onUpload={(file) => handleUploadProof(win.id, file)}
                            isLoading={submitting === win.id}
                            label="Submit Score Proof"
                            helperText="Screenshot of your 5 Stableford rounds"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-10">
                               <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                             </div>
                             <p className="text-xs text-emerald-700 font-black uppercase tracking-widest flex items-center gap-2 mb-1.5">
                               <CheckCircle2 className="w-4 h-4" /> Proof Lodged
                             </p>
                             <p className="text-[11px] text-emerald-600/80 font-bold leading-relaxed">Administrative review is in progress. We are validating your score ledger against draw requirements.</p>
                           </div>
                           <Button variant="outline" className="w-full gap-2 h-12 text-xs font-bold border-surface-200" onClick={() => window.open(win.proof_url, '_blank')}>
                             <ExternalLink className="w-4 h-4" /> View Lodged Evidence
                           </Button>
                           {win.verification_status === 'pending' && (
                             <div className="pt-2 border-t border-surface-100">
                               <p className="text-[10px] text-surface-400 font-bold text-center mb-3">Found a better screenshot?</p>
                               <FileUpload 
                                 onUpload={(file) => handleUploadProof(win.id, file)}
                                 isLoading={submitting === win.id}
                                 label="Replace Proof"
                                 className="opacity-70 hover:opacity-100 transition-opacity"
                               />
                             </div>
                           )}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {win.verification_status === 'approved' && win.payout_status === 'pending' && (
                <div className="px-10 py-5 bg-emerald-50/50 border-t border-emerald-100 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  </div>
                  <p className="text-[11px] text-surface-500 font-black uppercase tracking-widest">
                    Verification Complete. <span className="text-emerald-600">Disbursement initiated</span> to your registered account.
                  </p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-surface-200">
             <Trophy className="w-20 h-20 text-surface-100 mx-auto mb-6" />
             <h3 className="text-2xl font-extrabold text-surface-900 mb-2 tracking-tight">Your winner's circle is clear.</h3>
             <p className="text-surface-500 mb-10 max-w-sm mx-auto font-medium">Keep logging your performance and checking the monthly draws to appear here!</p>
             <Link href="/dashboard/scores">
               <Button className="h-12 px-8 font-extrabold rounded-xl shadow-lg shadow-brand-500/10">Log Recent Scores</Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: string, label: string }) {
  const configs: any = {
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    approved: { icon: CheckCircle2, color: "text-success-500", bg: "bg-success-500/10", border: "border-success-500/20" },
    paid: { icon: CheckCircle2, color: "text-brand-500", bg: "bg-brand-500/10", border: "border-brand-500/20" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  }

  const { icon: Icon, color, bg, border } = configs[status] || configs.pending

  return (
    <div className={cn("px-3 py-1.5 rounded-full border flex items-center gap-2", bg, border)}>
      <Icon className={cn("w-3.5 h-3.5", color)} />
      <div className="flex flex-col leading-none">
        <span className="text-[8px] uppercase font-black text-gray-500 opacity-60">{label}</span>
        <span className={cn("text-[10px] uppercase font-black tracking-widest", color)}>{status}</span>
      </div>
    </div>
  )
}

function Link({ children, href, className }: any) {
  const router = React.useMemo(() => ({ push: (url: string) => window.location.href = url }), [])
  return (
    <a href={href} className={className} onClick={(e) => { e.preventDefault(); router.push(href); }}>
      {children}
    </a>
  )
}
