"use client"

import * as React from "react"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Gift, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  Eye, 
  Check,
  X,
  CreditCard,
  UserCheck
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, cn, downloadAsCSV } from "@/lib/utils"
import * as Dialog from "@radix-ui/react-dialog"

export default function AdminWinnersPage() {
  const [winners, setWinners] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [selectedProofUrl, setSelectedProofUrl] = React.useState<string | null>(null)

  const fetchWinners = React.useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('draw_winners')
      .select('*, profiles(full_name), draws(draw_date)')
      .order('created_at', { ascending: false })
    
    if (data) setWinners(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchWinners()
  }, [fetchWinners])

  async function updateStatus(id: string, updates: any) {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/winners/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) fetchWinners()
    } catch (e) {
      console.error('Failed to update status:', e)
    }
    setIsProcessing(false)
  }

  const handleExport = () => {
    const exportData = winners.map(w => ({
      ID: w.id,
      Winner: w.profiles?.full_name,
      DrawDate: w.draws?.draw_date,
      Prize: w.prize_amount,
      Tier: w.tier,
      Verification: w.verification_status,
      Payout: w.payout_status,
      Proof: w.proof_url || 'N/A'
    }))
    downloadAsCSV(exportData, `golfdraw-winners-${new Date().toISOString().split('T')[0]}`)
  }

  const filteredWinners = winners.filter(w => 
    w.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500">Loading winners...</div>

  return (
    <div className="space-y-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Winner Management</h1>
          <p className="text-surface-500 font-medium">Review proof, verify winners, and track prize payouts.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 font-bold h-10 border-surface-200" onClick={handleExport}>
          <Gift className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* ── Tabs / Search ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
           <input 
             type="text" 
             placeholder="Search by winner name..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white border border-surface-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
           />
        </div>
      </div>

      {/* ── Table View (Desktop) ────────────────────────────────────────── */}
      <Card padding="none" className="hidden md:block overflow-hidden border-surface-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Winner</th>
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">Verification</th>
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest text-right">Award</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filteredWinners.map((winner) => (
                <tr key={winner.id} className="hover:bg-surface-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-900 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
                        {winner.profiles?.full_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{winner.profiles?.full_name}</span>
                        <span className="text-[10px] font-extrabold uppercase text-surface-400 tracking-widest mt-0.5">{formatDate(winner.draws?.draw_date)} • Tier {winner.tier}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <Badge 
                        variant={
                          winner.verification_status === 'approved' ? 'success' : 
                          winner.verification_status === 'rejected' ? 'outline' : 'accent'
                        }
                        className="font-bold min-w-[100px] text-center"
                      >
                        {winner.verification_status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-brand-700 text-sm">
                    {formatCurrency(winner.prize_amount)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      {winner.proof_url && (
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-surface-400 hover:text-surface-900" title="View Proof" onClick={() => setSelectedProofUrl(winner.proof_url)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {winner.verification_status === 'pending' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-emerald-600 hover:bg-emerald-50" onClick={() => updateStatus(winner.id, { verification_status: 'approved' })} disabled={isProcessing}><Check className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-red-600 hover:bg-red-50" onClick={() => updateStatus(winner.id, { verification_status: 'rejected' })} disabled={isProcessing}><X className="w-4 h-4" /></Button>
                        </div>
                      )}

                      {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                        <Button size="sm" variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-brand-50 text-brand-600 border border-brand-100" onClick={() => updateStatus(winner.id, { payout_status: 'paid' })} disabled={isProcessing}>
                          <CreditCard className="w-3 h-3" /> Payout
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Mobile View (Cards) ────────────────────────────────────────── */}
      <div className="md:hidden space-y-6">
        {filteredWinners.map((winner) => (
          <Card key={winner.id} className="p-6 border-surface-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-900 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                  {winner.profiles?.full_name?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-surface-900">{winner.profiles?.full_name}</span>
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">{formatDate(winner.draws?.draw_date)}</span>
                </div>
              </div>
              <Badge variant={winner.verification_status === 'approved' ? 'success' : winner.verification_status === 'rejected' ? 'outline' : 'accent'}>
                {winner.verification_status}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl mb-6">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Award Amount</span>
                 <span className="text-xl font-black text-brand-700">{formatCurrency(winner.prize_amount)}</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Winner Tier</span>
                 <span className="text-xs font-bold text-surface-900 border border-surface-200 px-3 py-1 rounded-full">Tier {winner.tier}</span>
               </div>
            </div>

            <div className="flex gap-3">
              {winner.proof_url && (
                <Button variant="outline" className="flex-1 h-12 gap-2 border-surface-200 font-bold" onClick={() => setSelectedProofUrl(winner.proof_url)}>
                  <Eye className="w-4 h-4" /> View Proof
                </Button>
              )}
              {winner.verification_status === 'pending' ? (
                <div className="flex flex-1 gap-2">
                  <Button className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => updateStatus(winner.id, { verification_status: 'approved' })} disabled={isProcessing}>Approve</Button>
                  <Button variant="outline" className="flex-1 h-12 text-red-600 border-red-100 hover:bg-red-50 font-bold" onClick={() => updateStatus(winner.id, { verification_status: 'rejected' })} disabled={isProcessing}>Reject</Button>
                </div>
              ) : (
                winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                  <Button className="flex-1 h-12 gap-2 font-black uppercase tracking-widest text-xs" onClick={() => updateStatus(winner.id, { payout_status: 'paid' })} disabled={isProcessing}>
                    <CreditCard className="w-4 h-4" /> Confirm Payout
                  </Button>
                )
              )}
            </div>
          </Card>
        ))}
      </div>

      {!filteredWinners.length && (
        <Card className="py-20 text-center border-dashed border-surface-200 bg-surface-50/10">
          <div className="flex flex-col items-center">
            <Clock className="w-16 h-16 text-surface-100 mb-6" />
            <p className="text-surface-400 font-black text-lg tracking-tight">No winning records identified yet.</p>
          </div>
        </Card>
      )}
    {/* ── Proof Preview Modal ───────────────────────────────────── */}
    <Dialog.Root open={!!selectedProofUrl} onOpenChange={(open) => !open && setSelectedProofUrl(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 fade-in duration-300 outline-none">
          <div className="absolute top-6 right-6 z-10">
            <Dialog.Close asChild>
              <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg">
                <X className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="h-full overflow-y-auto p-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-black text-surface-900">Proof Verification</Dialog.Title>
                <Dialog.Description className="text-sm font-medium text-surface-500">
                  Review the uploaded scorecard screenshot to validate the draw results.
                </Dialog.Description>
              </div>

              <div className="aspect-video w-full bg-surface-50 rounded-2xl overflow-hidden border border-surface-100 shadow-inner flex items-center justify-center">
                {selectedProofUrl && (
                  <img src={selectedProofUrl} alt="Winner Proof" className="max-w-full max-h-full object-contain" />
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Dialog.Close asChild>
                  <Button variant="outline" className="h-12 px-8 font-bold border-surface-200">Close Preview</Button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    </div>
  )
}
