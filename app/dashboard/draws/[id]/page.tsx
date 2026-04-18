export const dynamic = 'force-dynamic';
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Trophy, 
  ChevronLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Loading
} from "lucide-react"
import { formatDate, formatCurrency, cn } from "@/lib/utils"

export default function DrawDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [draw, setDraw] = React.useState<any>(null)
  const [winnerRecord, setWinnerRecord] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const [drawRes, winnerRes] = await Promise.all([
      supabase.from('draws').select('*').eq('id', id).single(),
      supabase.from('draw_winners').select('*').eq('draw_id', id).eq('user_id', user.id).single()
    ])

    if (drawRes.data) setDraw(drawRes.data)
    if (winnerRes.data) setWinnerRecord(winnerRes.data)
    setLoading(false)
  }, [id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user?.id}/${id}/${Math.random()}.${fileExt}`
    
    const { error: uploadError, data } = await supabase.storage
      .from('draw-proofs')
      .upload(fileName, file)

    if (uploadError) {
      setUploadError(uploadError.message)
      setUploading(false)
      return
    }

    // 2. Update Winner Record
    const { data: { publicUrl } } = supabase.storage.from('draw-proofs').getPublicUrl(fileName)
    
    const { error: updateError } = await supabase
      .from('draw_winners')
      .update({ 
        proof_url: publicUrl,
        verification_status: 'pending' 
      })
      .eq('id', winnerRecord.id)

    if (updateError) {
      setUploadError(updateError.message)
    } else {
      fetchData()
    }
    setUploading(false)
  }

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500">Loading draw details...</div>
  if (!draw) return <div className="pt-20 text-center text-gray-500">Draw not found.</div>

  const isWinner = !!winnerRecord
  const isVerified = winnerRecord?.verification_status === 'approved'

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Results
      </button>

      {/* ── Draw Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="accent" className="mb-4">Draw ID: {draw.id.slice(0, 8)}</Badge>
          <h1 className="text-4xl font-black">{formatDate(draw.draw_date)} Draw</h1>
          <p className="text-gray-500 mt-2">Final results and prize distribution breakdown.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Prize Pool</p>
          <p className="text-3xl font-black text-brand-400">{formatCurrency(draw.prize_pool + draw.rollover_amount)}</p>
        </div>
      </div>

      {/* ── Winning Numbers ────────────────────────────────────────── */}
      <Card className="p-10 border-0 bg-gradient-to-br from-surface-800 to-surface-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Trophy className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="text-center">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 block">The Winning Numbers</span>
             <div className="flex justify-center gap-3 md:gap-6">
               {draw.numbers.map((n: number, i: number) => (
                 <div key={i} className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-brand-600 text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                   {n}
                 </div>
               ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
             <div className="text-center">
               <span className="block text-xl font-bold text-white">{draw.total_participants}</span>
               <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Participants</span>
             </div>
             <div className="text-center">
               <span className="block text-xl font-bold text-white">1,242</span>
               <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Total Matches</span>
             </div>
             <div className="text-center">
               <span className="block text-xl font-bold text-brand-400">{formatCurrency(draw.prize_pool / 10)}</span>
               <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Charity Share</span>
             </div>
          </div>
        </div>
      </Card>

      {/* ── Your Result ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Card className={cn(
            "p-8",
            isWinner ? "border-success-500/30 bg-success-500/5 shadow-xl shadow-success-500/5" : "border-surface-800"
          )}>
            <div className="flex items-center gap-4 mb-8">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isWinner ? "bg-success-500/10 text-success-500" : "bg-surface-700 text-gray-500"
              )}>
                {isWinner ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{isWinner ? 'You Won!' : 'Better luck next time'}</h3>
                <p className="text-sm text-gray-500">{isWinner ? `You matched ${winnerRecord.matched_numbers.length} numbers.` : 'No matches found with your scores.'}</p>
              </div>
            </div>

            {isWinner && (
              <div className="space-y-8">
                <div className="flex justify-between items-center p-6 bg-success-500/10 rounded-2xl border border-success-500/20">
                  <span className="text-sm font-bold text-success-400 uppercase tracking-widest">Your Prize</span>
                  <span className="text-3xl font-black text-white">{formatCurrency(winnerRecord.prize_amount)}</span>
                </div>

                {/* Proof Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold">Claim Your Winnings</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    To maintain the integrity of our draws, we require a quick verification. Please upload a clear photo of your scorecard or your ID if requested.
                  </p>

                  {winnerRecord.proof_url ? (
                    <div className="p-6 bg-surface-800 rounded-2xl border border-surface-700 flex flex-col items-center gap-4">
                       <CheckCircle2 className="w-12 h-12 text-success-500" />
                       <p className="text-sm font-bold">Proof Submitted</p>
                       <p className="text-xs text-gray-500">Status: <span className="text-brand-400 uppercase font-black">{winnerRecord.verification_status}</span></p>
                       <a href={winnerRecord.proof_url} target="_blank" className="text-xs text-brand-500 hover:underline">View Uploaded Image</a>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                      />
                      <div className="p-10 border-2 border-dashed border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-4 group-hover:border-brand-500 transition-colors">
                        <div className="w-12 h-12 bg-surface-800 rounded-full flex items-center justify-center text-gray-500 group-hover:text-brand-500">
                          {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-500 border-t-transparent" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-bold text-gray-400">Click or drag to upload proof</p>
                        <p className="text-[10px] text-gray-600 uppercase font-black">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Draw Tier Breakdown</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">Jackpot</span>
                   <span className="text-[10px] text-gray-500">5 Matches</span>
                 </div>
                 <Badge variant="accent">40% Share</Badge>
               </div>
               <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">Tier 2</span>
                   <span className="text-[10px] text-gray-500">4 Matches</span>
                 </div>
                 <Badge variant="outline">35% Share</Badge>
               </div>
               <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">Tier 3</span>
                   <span className="text-[10px] text-gray-500">3 Matches</span>
                 </div>
                 <Badge variant="outline">25% Share</Badge>
               </div>
            </div>
          </Card>

          <Card className="bg-brand-600/10 border-brand-500/20">
            <h3 className="text-sm font-bold text-brand-400 mb-2 font-heading">Need Help?</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              If you have issues with your matches or verification, our support pro is here to help.
            </p>
            <Button variant="ghost" size="sm" className="w-full text-brand-500 hover:bg-brand-500/10 h-10"> Contact Payout Support</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
